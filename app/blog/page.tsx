import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("blog");

export const metadata = routes.indexMetadata;

export default routes.IndexPage;
