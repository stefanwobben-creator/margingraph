import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("reports");

export const metadata = routes.indexMetadata;

export default routes.IndexPage;
