const { default: axios } = require("axios")

const cookie = 'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalkyTUdRMlpqTTJObVZtTnpFNU1XRTNaalkyTldFeU9TSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCbmJXRnBiQzVqYjIwaUxDSnBZWFFpT2pFM01USXhOVFkwTnpaOS41anZST2hsZkp5RXpabEFqbHBJUmRNMHZmUGxOd2pnODMzS0ZIVDVEcDJvIn0=; Path=/; Secure; HttpOnly;';
const doRequest = async () => {
  const { data } = await axios.post(
    'https://ticketing.dev/api/tickets',
    {
      title: 'ticket',
      price: 500
    },
    {
      headers: {cookie}
    }
  );

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 700
    },
    {
      headers: {cookie}
    }
  );

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 900
    },
    {
      headers: {cookie}
    }
  );

  console.log('Request Completed');
};

(async () => {
  for (let index = 0; index < 400; index++) {
    doRequest();
  }
})();