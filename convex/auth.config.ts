/**
 * Tells the deployment which issuer to trust for JWTs. A wrong `domain` here is
 * silent: every request simply arrives unauthenticated.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
