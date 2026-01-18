// Application routes configuration
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { HomePage, RedirectPage, NotFoundPage, HistoryPage } from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/r/:code",
    element: <RedirectPage />,
  },
]);
