import { useRouter } from "expo-router";

type RouterReplace = Parameters<ReturnType<typeof useRouter>["replace"]>[0];

export function useSafeBack(fallback: RouterReplace = "/(matching)/active-rides") {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace(fallback));
}
