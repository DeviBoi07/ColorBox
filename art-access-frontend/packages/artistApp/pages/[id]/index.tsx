import { GetServerSideProps } from "next";
import { ShortLinkApi } from "@colourbox/ac-server";
import { ServerURI } from "@colourbox/common/utils/IAsyncResult";
import { Box, Alert } from "@mui/material";

type ShortLinkProps = {
  linkId?: string;
};

export default function ShortLink({ linkId }: ShortLinkProps) {
  return (
    <Box>
      <Alert severity="error">Failed to load</Alert>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps<ShortLinkProps> = async ({
  query: { id },
  res,
}) => {
  //https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props#caching-with-server-side-rendering-ssr

  // This value is considered fresh for ten seconds (s-maxage=10).
  // If a request is repeated within the next 10 seconds, the previously
  // cached value will still be fresh. If the request is repeated before 59 seconds,
  // the cached value will be stale but still render (stale-while-revalidate=59).
  //
  // In the background, a revalidation request will be made to populate the cache
  // with a fresh value. If you refresh the page, you will see the new value.

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  try {
    if (!id) throw new Error("id is null");

    const shortLinkApi = new ShortLinkApi(undefined, ServerURI.serverSide);

    const {
      data: { forwardUrl },
    } = await shortLinkApi.apiShortLinkLinkIdGet(id.toString());

    if (forwardUrl) {
      return {
        redirect: {
          statusCode: 301,
          destination: forwardUrl,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error(
      "ERROR: shortLink/ID:getServerSideProps failed to load artwork",
      error
    );
    return {
      props: {},
    };
  }
};
