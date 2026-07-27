import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("guides");

export const metadata = routes.indexMetadata;

export default routes.IndexPage;
