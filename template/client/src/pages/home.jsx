import { useLoaderData } from "react-router-dom";

function Home() {
  const loaderData = useLoaderData();

  return <p>{loaderData}</p>;
}

export default {
  path: "/home",
  element: <Home />,
  loader: () => "hello world",
};
