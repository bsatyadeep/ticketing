import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) =>{
  return (
  <div>
    <Header currentUser={currentUser}></Header>
    <div className='container'>
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  </div>);
};

AppComponent.getInitialProps = async (appContext) =>{
  // console.log(Object.keys(appContext));
  // console.log(appContext);
  const client = buildClient(appContext.ctx);

  const { data } = await client.get(process.env.NEXT_PUBLIC_CURRENT_USER_URL);

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  // return {
  //   pageProps,
  //   currentUser: data.currentUser};

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;