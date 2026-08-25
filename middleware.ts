import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/signin" },
});

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/inventory/:path*", "/purchases/:path*", "/sales/:path*", "/customers/:path*", "/suppliers/:path*", "/finance/:path*", "/expenses/:path*", "/reports/:path*", "/settings/:path*"],
};
