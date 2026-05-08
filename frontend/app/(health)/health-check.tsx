import { TouchableOpacity, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';

export default function HealthCheck() {
  return (
    <TouchableOpacity
      onPress={() => {
        Sentry.captureMessage('Health check: Sentry integration test');
      }}
    >
      <Text>Break the world</Text>
    </TouchableOpacity>
  );
}