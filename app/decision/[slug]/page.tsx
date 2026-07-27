import { createCollectionRoutes } from "@/lib/content/routes";

const routes = createCollectionRoutes("decisions");

export const generateStaticParams = routes.generateStaticParams;
export const generateMetadata = routes.generateMetadata;
export const dynamicParams = false;

export default routes.Page;
