const axios = require("axios");

class Mpesa {
  constructor(consumer_key, consumer_secret) {
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
  }

  //First method...to get the access_token from the passed arguments
  access_token() {
    const url =
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth =
      "Basic " +
      new Buffer.from(this.consumer_key + ":" + this.consumer_secret).toString(
        "base64"
      );

    //axios
    return axios.get(url, {
      headers: {
        Authorization: auth,
        "content-type": "application/json",
      },
    });
  }

  //Second method, this initiates the stk push
  stk_push() {
    return `Hello world`;
  }
}

module.exports = Mpesa;
