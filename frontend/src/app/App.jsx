import { RouterProvider } from "react-router";
import router from "./app.route";
const App = ()=>{
  return (
    <RouterProvider router={router} />
  )
}

export default App;