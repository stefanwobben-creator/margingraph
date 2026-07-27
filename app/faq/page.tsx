import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("faq");

export const metadata = routes.indexMetadata;

export default routes.IndexPage;
