// import axios from "axios";
// import buildClient from "../api/build-client";

import Link from "next/link";

const LandingPage = ({currentUser, tickets}) =>{
  // console.log(currentUser);
  // console.log(
  // axios.get(process.env.NEXT_PUBLIC_CURRENT_USER_URL));
  // console.log(tickets);
  return currentUser ? 
    // (<h1>You are Signed in </h1>) : 
    displayTicket(tickets) :
    (<h1>You are not signed in </h1>);
};
const displayTicket = (tickets) => {
  const ticketsList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
            <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
              View
            </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table table-responsive">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketsList}
        </tbody>
      </table>
    </div>
  );
};

// LandingPage.getInitialProps = async ({ req }) =>{
//   // console.log(req.headers);
//   // if(typeof window === 'undefined'){
//   //   // we're in server
//   //   // http://servicename.namespace.svc.cluster.local
//   //   const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NGINX_BASE_URL}${process.env.NEXT_PUBLIC_CURRENT_USER_URL}`,{
//   //     // headers: {
//   //     //   Host: process.env.NEXT_PUBLIC_DOMAIN_URL
//   //     // }
//   //     headers: req.headers
//   //     })
//   //     .catch((err)=>{
//   //       console.log(err);
//   //     });
//   //     return data;
//   // }else{
//   //   // we're on the browser
//   //     const { data } = await axios.get(`${process.env.NEXT_PUBLIC_CURRENT_USER_URL}`)
//   //     .catch((err)=>{
//   //       console.log(err);
//   //     });
//   //     return data;
//   // }

//   const { data } = await buildClient({ req }).get(`${process.env.NEXT_PUBLIC_CURRENT_USER_URL}`);
//   return data;
// };

LandingPage.getInitialProps = async (context, client, currentUser) =>{
  // const client = buildClient(context);
  // const { data } = await client.get(`${process.env.NEXT_PUBLIC_CURRENT_USER_URL}`);
  // return data;

  const { data } = await client.get(process.env.NEXT_PUBLIC_TICKET_URL);
  return { tickets: data};
};

export default LandingPage;

