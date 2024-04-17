import axios from "axios";

export default ({ req }) =>{
  if(typeof window === 'undefined'){
    //We're on the Server
    return axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_NGINX_BASE_URL}`,
      headers: req.headers
    });
  }else{
    //We're on the browser
    return axios.create({
      baseURL: '/'
    });
  }
};