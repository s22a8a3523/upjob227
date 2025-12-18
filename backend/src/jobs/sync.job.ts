import * as cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import * as googleAdsSync from '../services/googleAds';
import * as shopeeSync from '../services/shopee';
import * as lazadaSync from '../services/lazada';
import * as facebookSync from '../services/facebook';
import * as ga4Sync from '../services/ga4';

const syncFunctions: Record<string, (integration: any) => Promise<any>> = {
  google_ads: googleAdsSync.sync,
  facebook: facebookSync.sync,
  ga4: ga4Sync.sync,
  shopee: shopeeSync.sync,
  lazada: lazadaSync.sync,
};

// Run sync every hour
export const startSyncJob = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting scheduled sync job...');
    
    try {
      // Get all active integrations
      const integrations = await prisma.integration.findMany({
        where: {
          isActive: true,
          // Only sync integrations that haven't been synced in the last hour
          OR: [
            { lastSyncAt: null },
            { lastSyncAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
          ],
        },
      });

      logger.info(`Found ${integrations.length} integrations to sync`);

      for (const integration of integrations) {
        try {
          const syncFn = syncFunctions[integration.provider];
          if (!syncFn) {
            logger.warn(`No sync function for provider: ${integration.provider}`);
            continue;
          }

          logger.info(`Syncing integration: ${integration.id} (${integration.provider})`);
          await syncFn(integration);
          logger.info(`Successfully synced integration: ${integration.id}`);
        } catch (error: any) {
          logger.error(`Failed to sync integration ${integration.id}: ${error.message}`);
          
          // Update integration status to error
          await prisma.integration.update({
            where: { id: integration.id },
            data: { status: 'error' },
          });
        }
      }

      logger.info('Scheduled sync job completed');
    } catch (error: any) {
      logger.error(`Scheduled sync job failed: ${error.message}`);
    }
  });

  logger.info('Scheduled sync job started (runs every hour)');
};

