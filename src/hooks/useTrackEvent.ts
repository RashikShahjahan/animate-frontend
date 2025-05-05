import { useAnalytics } from 'rashik-analytics-provider';

/**
 * Custom hook for tracking events in the application
 * @returns Object with trackEvent function
 */
export const useTrackEvent = () => {
  const { trackEvent } = useAnalytics();

  /**
   * Track a custom event
   * @param eventName The name of the event to track
   * @param metadata Additional data to include with the event
   */
  const track = (eventName: string, metadata?: Record<string, unknown>) => {
    trackEvent(eventName, metadata || {});
  };

  return { track };
};

export default useTrackEvent; 