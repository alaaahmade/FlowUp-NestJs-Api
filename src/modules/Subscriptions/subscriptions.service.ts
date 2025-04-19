// subscriptions.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';
import { AppConfigService } from '@/config/config.service';
import { Plans } from './entities/subscriptions-planes';
import { UpdatePlanDto } from './dto/create-plan.dto';
import { IncomingMessage } from 'http';

@Injectable()
export class SubscriptionsService {
  stripe: Stripe;
  constructor(
    @InjectRepository(Subscriptions)
    private subscriptionRepo: Repository<Subscriptions>,

    @InjectRepository(MobileUser)
    private userRepo: Repository<MobileUser>,

    private readonly config: AppConfigService,
    @InjectRepository(Plans)
    private plansRepo: Repository<Plans>,
  ) {
    this.stripe = new Stripe(this.config.config.stripe.secretKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async createCustomer(email: string): Promise<string> {
    const customer = await this.stripe.customers.create({ email });
    return customer.id;
  }
  async createCheckoutSession(userId: string, credits: number) {
    const creditBerJod = this.config.config.subscription.creditBerJOD;
    const amountJOD = credits / creditBerJod; // 3 credits = 1 JOD

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'jod',
            product_data: {
              name: `${credits} Booking Credits`,
            },
            unit_amount: Math.round(amountJOD * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: { userId },
      success_url: `https://yorrPass.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yorrPass.com/payment/cancel`,
    });

    const subscription = this.subscriptionRepo.create({
      user,
      amountJOD,
      credits,
      stripeSessionId: session.id,
      status: 'pending',
    });

    await this.subscriptionRepo.save(subscription);

    return session.url;
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      // Verify Stripe webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.config.stripe.webhookSecret, // Add webhook secret to .env
      );
    } catch (err) {
      console.error(
        '⚠️ Stripe webhook signature verification failed.',
        err.message,
      );
      return { error: 'Invalid signature' };
    }

    // Handle successful checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscription = await this.subscriptionRepo.findOne({
        where: { stripeSessionId: session.id },
        relations: ['user'],
      });

      if (!subscription) {
        console.warn('No matching subscription found for session:', session.id);
        return;
      }

      if (subscription.status !== 'paid') {
        // Update the subscription status and user credits
        subscription.status = 'paid';
        await this.subscriptionRepo.save(subscription);

        subscription.user.credits += subscription.credits;
        await this.userRepo.save(subscription.user);

        console.log(`✅ Credits updated for user ${subscription.user.id}`);
      }
    }
    return { received: true };
  }

  async streamToBuffer(stream: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
  async getSubscriptions(): Promise<Subscriptions[]> {
    return this.subscriptionRepo.find({
      relations: ['user'],
      select: {
        id: true,
        amountJOD: true,
        credits: true,
        status: true,
        createdAt: true,
        user: {
          id: true,
          fullName: true,
          email: true,
          profilePicture: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteSubscription(id: string) {
    return await this.subscriptionRepo.delete(id);
  }

  async getSubscriptionHistory(userId: string): Promise<Subscriptions[]> {
    return this.subscriptionRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      select: {
        id: true,
        amountJOD: true,
        credits: true,
        status: true,
        createdAt: true,
        user: {
          id: true,
          fullName: true,
          email: true,
          profilePicture: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async refundSubscription(subscriptionId: number): Promise<Subscriptions> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'paid') {
      throw new BadRequestException('Only paid subscriptions can be refunded');
    }

    if (!subscription.stripeSessionId) {
      throw new BadRequestException(
        'No Stripe session ID available for refund',
      );
    }

    // Call Stripe to refund
    const session = await this.stripe.checkout.sessions.retrieve(
      subscription.stripeSessionId,
    );
    const paymentIntentId = session.payment_intent as string;

    await this.stripe.refunds.create({ payment_intent: paymentIntentId });

    subscription.status = 'refunded';
    await this.subscriptionRepo.save(subscription);

    subscription.user.credits += subscription.credits;
    await this.userRepo.save(subscription.user);

    return subscription;
  }

  async createMonthlySubscription(
    customerId: string,
    planId: string,
  ): Promise<any> {
    try {
      const plan = await this.plansRepo.findOne({
        where: { id: planId },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      if (!plan.stripePriceId) {
        throw new NotFoundException(
          'Stripe price ID is not associated with the plan',
        );
      }

      const priceId = plan.stripePriceId;
      if (!priceId) {
        throw new BadRequestException('Price ID not found for the plan');
      }
      const user = await this.userRepo.findOne({
        where: { id: customerId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let strCustomerId = user.stripeCustomerId;

      if (!strCustomerId) {
        const createdCustomer = await this.stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });

        strCustomerId = createdCustomer.id;
        user.stripeCustomerId = strCustomerId;
        await this.userRepo.save(user);
      }

      if (!strCustomerId) {
        throw new NotFoundException('Stripe customer not found');
      }
      // const strCustomerId = strCustomer.id;

      const stripeSub = await this.stripe.subscriptions.create({
        customer: strCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        // expand: ['latest_invoice.payment_intent'],
      });
      const customer = await this.userRepo.findOne({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `https://yorrPass.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://yorrPass.com/payment/cancel`,
        customer: strCustomerId,
        // Add additional fields as needed (e.g., metadata)
      });
      await this.subscriptionRepo.save({
        user: customer,
        credits: plan.credits,
        amountJOD: plan.amountJOD,
        status: 'pending',
        isRecurring: true,
        stripeSubscriptionId: stripeSub.id,
        stripeSessionId: session.id,
        stripePriceId: plan.stripePriceId,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelMonthlySubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: { id: +subscriptionId },
      });
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }
      if (!subscription.stripeSubscriptionId) {
        throw new BadRequestException(
          'Stripe subscription ID is not available',
        );
      }
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true, // or false, based on your logic
        },
      );

      await this.subscriptionRepo.update(subscriptionId, {
        status: 'canceled',
      });

      // await this.subscriptionRepo.delete(subscriptionId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new BadRequestException('Failed to cancel subscription');
    }
    return {
      message: 'Subscription canceled successfully',
    };
  }

  async createMonthlyPlan(
    productName: string,
    priceAmount: number,
    credits: number,
  ): Promise<Plans> {
    try {
      const product = await this.stripe.products.create({
        name: productName,
        type: 'service',
      });

      const price = await this.stripe.prices.create({
        unit_amount: Math.round(priceAmount * 1000), // Convert to cents
        currency: 'jod',
        recurring: { interval: 'month' },
        product: product.id,
      });
      // Save to local DB
      const newPlan = await this.plansRepo.save({
        name: product.name,
        stripeProductId: product.id,
        stripePriceId: price.id,
        amountJOD: priceAmount,
        credits: credits,
        isRecurring: true,
        stripeSubscriptionId: null,
      });

      return newPlan;
    } catch (error) {
      console.error('Error creating plan: ', error);
      throw new BadRequestException('Failed to create monthly plan');
    }
  }

  async getAllPlans(): Promise<Plans[]> {
    return this.plansRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<Plans> {
    const plan = await this.plansRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    let productId = plan.stripeProductId;
    let priceNeedsUpdate = false;
    let productNeedsUpdate = false;

    if (!productId) {
      return plan;
    }

    if (dto.amountJOD && dto.amountJOD !== plan.amountJOD) {
      priceNeedsUpdate = true;
    }

    if (dto.name && dto.name !== plan.name) {
      productNeedsUpdate = true;
    }

    // Create new product if name changed
    if (productNeedsUpdate) {
      const newProduct = await this.stripe.products.create({
        name: dto.name as string,
        type: 'service',
      });

      // Optionally deactivate the old product
      await this.stripe.products.update(plan.stripeProductId, {
        active: false,
      });

      productId = newProduct.id;
    }

    // Create new price if amount changed or new product was created
    if (priceNeedsUpdate || productNeedsUpdate) {
      const newPrice = await this.stripe.prices.create({
        unit_amount: Math.round((dto.amountJOD ?? plan.amountJOD) * 100),
        currency: 'jod',
        recurring: { interval: 'month' },
        product: productId,
      });
      plan.stripePriceId = newPrice.id;
      plan.stripeProductId = productId;
      plan.amountJOD = dto.amountJOD ?? plan.amountJOD;
      plan.credits = dto.credits ?? plan.credits;
    }

    plan.name = dto.name ?? plan.name;
    plan.amountJOD = dto.amountJOD ?? plan.amountJOD;
    plan.credits = dto.credits ?? plan.credits;

    return this.plansRepo.save(plan);
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    const plan = await this.plansRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Archive product on Stripe (optional)
    await this.stripe.products.update(plan.stripeProductId, { active: false });

    await this.plansRepo.remove(plan);
    return { message: 'Plan deleted successfully' };
  }
}
