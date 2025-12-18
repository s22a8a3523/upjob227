import axios from 'axios';
import { prisma } from '../utils/prisma';

export interface FacebookCredentials {
  accessToken: string;
  accountId: string;
  appId: string;
  appSecret: string;
}

export interface FacebookCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  date_start: string;
  date_stop: string;
}

export interface FacebookInsight {
  date_start: string;
  date_stop: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  reach: number;
  actions: Array<{
    action_type: string;
    value: number;
  }>;
}

class FacebookService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async getCredentials(tenantId: string): Promise<FacebookCredentials | null> {
    const integration = await prisma.integration.findFirst({
      where: { 
        tenantId, 
        provider: 'facebook',
        isActive: true 
      }
    });

    if (!integration) return null;

    return integration.config as unknown as FacebookCredentials;
  }

  async validateCredentials(credentials: FacebookCredentials): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/me?access_token=${credentials.accessToken}`
      );
      return response.status === 200;
    } catch (error) {
      console.error('Facebook API validation failed:', error);
      return false;
    }
  }

  async getCampaigns(tenantId: string, dateRange?: { start: string; end: string }): Promise<FacebookCampaign[]> {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) throw new Error('Facebook credentials not found');

    try {
      const timeRange = dateRange 
        ? `&time_range={\"since\":\"${dateRange.start}\",\"until\":\"${dateRange.end}\"}`
        : '&time_range={\"since\":\"2024-01-01\",\"until\":\"2024-12-31\"}';

      const response = await axios.get(
        `${this.baseUrl}/act_${credentials.accountId}/campaigns?` +
        `fields=name,status,objective,spend,impressions,clicks,cpc,ctr,date_start,date_stop` +
        `&access_token=${credentials.accessToken}${timeRange}`
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook campaigns fetch failed:', error);
      throw new Error('Failed to fetch Facebook campaigns');
    }
  }

  async getInsights(tenantId: string, campaignId?: string, dateRange?: { start: string; end: string }): Promise<FacebookInsight[]> {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) throw new Error('Facebook credentials not found');

    try {
      const timeRange = dateRange 
        ? `&time_range={\"since\":\"${dateRange.start}\",\"until\":\"${dateRange.end}\"}`
        : '&time_range={\"since\":\"2024-01-01\",\"until\":\"2024-12-31\"}';

      const endpoint = campaignId 
        ? `${this.baseUrl}/${campaignId}/insights`
        : `${this.baseUrl}/act_${credentials.accountId}/insights`;

      const response = await axios.get(
        `${endpoint}?` +
        `fields=date_start,date_stop,spend,impressions,clicks,cpc,ctr,reach,actions` +
        `&access_token=${credentials.accessToken}${timeRange}`
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook insights fetch failed:', error);
      throw new Error('Failed to fetch Facebook insights');
    }
  }

  async getAdAccounts(tenantId: string): Promise<any[]> {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) throw new Error('Facebook credentials not found');

    try {
      const response = await axios.get(
        `${this.baseUrl}/me/adaccounts?` +
        `fields=name,account_id,status,currency,timezone_name` +
        `&access_token=${credentials.accessToken}`
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook ad accounts fetch failed:', error);
      throw new Error('Failed to fetch Facebook ad accounts');
    }
  }

  async getAuthUrl(appId: string, redirectUri: string, state: string): Promise<string> {
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=ads_read,ads_management&state=${state}`;
  }

  async exchangeCodeForToken(code: string, appId: string, appSecret: string, redirectUri: string): Promise<any> {
    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Facebook token exchange failed:', error);
      throw new Error('Failed to exchange code for token');
    }
  }

  async refreshToken(tenantId: string): Promise<string> {
    const integration = await prisma.integration.findFirst({
      where: { 
        tenantId, 
        provider: 'facebook',
        isActive: true 
      }
    });

    if (!integration) {
      throw new Error('Facebook integration not found');
    }

    const credentials = integration.config as unknown as FacebookCredentials;
    
    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_short',
          client_id: credentials.appId,
          client_secret: credentials.appSecret,
          fb_exchange_token: credentials.accessToken,
        }
      });
      
      const newAccessToken = response.data.access_token;
      
      // Update the integration with new token
      const updatedConfig = { ...credentials, accessToken: newAccessToken };
      await prisma.integration.update({
        where: { id: integration.id },
        data: { config: updatedConfig }
      });

      return newAccessToken;
    } catch (error) {
      console.error('Facebook token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }
  }
}

export const facebookService = new FacebookService();
