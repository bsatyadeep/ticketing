
const OrderIndex = ({ orders}) => {
  const orderList = <ul>
    {orders.map(order => {
      return <li key={order.id}>
        {order.ticket.title}-{order.status}
      </li>
    })}
  </ul>;

  return (
    <div>
      <h1>Orders List</h1>
      {orderList}
    </div>
  );
}
OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get(process.env.NEXT_PUBLIC_ORDER_URL);

  return { orders: data}
}
export default OrderIndex;