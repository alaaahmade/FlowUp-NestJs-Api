import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  Get,
  Delete,
  Param,
  Put,
  Header,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Create a one-time checkout session for credits
  @Post('create-session')
  @ApiOperation({ summary: 'Create a one-time checkout session for credits' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  async createSession(@Body() body: { userId: string; credits: number }) {
    const sessionUrl = await this.subscriptionsService.createCheckoutSession(
      body.userId,
      body.credits,
    );
    return { url: sessionUrl };
  }

  // Handle Stripe Webhook for subscription events
  @Public()
  @Post('webhook')
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Handle Stripe webhook for subscription events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook received and processed successfully',
  })
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody: Buffer = req.body as unknown as Buffer;
    return this.subscriptionsService.handleWebhook(rawBody, signature);
  }

  // Get all subscriptions
  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  async getSubscriptions() {
    return await this.subscriptionsService.getSubscriptions();
  }

  // Delete a subscription by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  async deleteSubscription(@Param('id') id: string) {
    return await this.subscriptionsService.deleteSubscription(id);
  }

  // Get subscription history for a user
  @Get('history/:userId')
  @ApiOperation({ summary: 'Get subscription history for a user' })
  @ApiResponse({
    status: 200,
    description: 'Subscription history retrieved successfully',
  })
  async getSubscriptionHistory(@Param('userId') userId: string) {
    return await this.subscriptionsService.getSubscriptionHistory(userId);
  }

  // Refund a subscription by ID
  @Get('refund/:subscriptionId')
  @ApiOperation({ summary: 'Refund a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription refunded successfully',
  })
  async refundSubscription(@Param('subscriptionId') subscriptionId: number) {
    const subscription =
      await this.subscriptionsService.refundSubscription(subscriptionId);
    return {
      message: 'Subscription refunded successfully',
      subscription,
    };
  }

  // Create a monthly subscription plan
  @Post('create-monthly-plan')
  @ApiOperation({ summary: 'Create a new monthly subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'Monthly plan created successfully',
  })
  async createMonthlyPlan(@Body() createPlanDto: CreatePlanDto) {
    return await this.subscriptionsService.createMonthlyPlan(
      createPlanDto.name,
      +createPlanDto.amountJOD,
      +createPlanDto.credits,
    );
  }

  // Get all subscription plans
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
  })
  async getPlans() {
    return await this.subscriptionsService.getAllPlans();
  }

  // Update a subscription plan by ID
  @Put('plans/:id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan updated successfully',
  })
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return await this.subscriptionsService.updatePlan(id, dto);
  }

  // Delete a subscription plan by ID
  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan deleted successfully',
  })
  async deletePlan(@Param('id') id: string) {
    return await this.subscriptionsService.deletePlan(id);
  }

  // Subscribe user to a monthly plan
  @Post('subscribe-monthly')
  @ApiOperation({ summary: 'Subscribe user to a monthly subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'User subscribed successfully',
  })
  async createMonthlySubscription(
    @Body() body: { userId: string; planId: string },
  ) {
    return await this.subscriptionsService.createMonthlySubscription(
      body.userId,
      body.planId,
    );
  }

  // Cancel a monthly subscription by ID
  @Delete('cancel-monthly/:subscriptionId')
  @ApiOperation({ summary: 'Cancel a monthly subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  async cancelMonthlySubscription(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return await this.subscriptionsService.cancelMonthlySubscription(
      subscriptionId,
    );
  }
}
