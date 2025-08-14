import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { awsConfig } from './aws';

export const cloudWatchClient = new CloudWatchClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
});

export const logMetric = async (metricName: string, value: number, unit: StandardUnit = StandardUnit.Count) => {
  try {
    const command = new PutMetricDataCommand({
      Namespace: 'SegtrackFrontend',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }]
    });
    await cloudWatchClient.send(command);
  } catch (error) {
    console.error('Erro ao enviar métrica para CloudWatch:', error);
  }
};

export const logError = async (error: Error, context: string) => {
  try {
    const command = new PutMetricDataCommand({
      Namespace: 'SegtrackFrontend',
      MetricData: [{
        MetricName: 'FrontendError',
        Value: 1,
        Unit: StandardUnit.Count,
        Timestamp: new Date(),
        Dimensions: [
          { Name: 'ErrorType', Value: error.name },
          { Name: 'Context', Value: context }
        ]
      }]
    });
    await cloudWatchClient.send(command);
  } catch (err) {
    console.error('Erro ao registrar erro no CloudWatch:', err);
  }
}; 