import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("reports");

export const generateStaticParams = routes.generateCategoryParams;
export const generateMetadata = routes.generateCategoryMetadata;
export const dynamicParams = false;

export default routes.CategoryPage;
