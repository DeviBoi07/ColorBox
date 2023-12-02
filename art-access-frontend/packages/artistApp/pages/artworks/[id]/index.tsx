/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArtWorksApi,
  Artwork,
  CreatorProfile,
  OrderPrintApi,
  StripePaymentIntent,
  /* CreatorProfilesApi, */
} from "@colourbox/ac-server";

import { NextSeo } from "next-seo";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { CaptureToCrmModal } from "@colourbox/common/utils/crmAction";
import {
  ErrorString,
  IAsyncResult,
  ServerURI,
} from "@colourbox/common/utils/IAsyncResult";
import { StripePayModal } from "@/components/checkout/StripePayModal";
import LoadingSpinner from "@colourbox/common/utils/LoadingSpinner";
import { ShippingModal } from "@/components/checkout/shippingModal";

interface ArtworkInfoProps {
  artwork?: Artwork;
  artist?: CreatorProfile;
}
const ArtworkInfo = ({ artwork, artist }: ArtworkInfoProps) => {
  const router = useRouter();
  const { id: routedId } = router.query;
  const artworkId = typeof routedId === "string" ? routedId : "";

  const [selectedSale, setSelectedSale] = useState<number>();

  const [captureCrmReason, setCaptureCrmReason] = useState<string>();
  const [showPrintSizes, setShowPrintSize] = useState(false);

  const [showShipPrints, setShowShipPrints] = useState<boolean>();

  if (!artwork || !artist) {
    if (!artworkId) {
      return <LoadingSpinner progressSize={48} my={10} />;
    } else {
      return (
        <Box sx={{ mx: "auto", my: 10 }}>
          <Alert severity="error">Couldn&apos;t find this artwork</Alert>
        </Box>
      );
    }
  }
  /* To ad twiter do 
https://www.makeuseof.com/open-graph-protocol-nextjs-implement/
  twitter={{
        handle: '@handle',
        site: '@site',
        cardType: 'summary_large_image',
      }}
  */

  async function printPayMentIntent() {
    const orderPrintApi = new OrderPrintApi(undefined, ServerURI.clientSide);

    if (!selectedSale) throw new Error("no size selected");

    const selectedSize =
      artwork?.saleDetails &&
      artwork?.saleDetails.length > selectedSale &&
      artwork.saleDetails[selectedSale].size;

    if (!selectedSize) {
      throw new Error("invalid selected size");
    }

    const { data: paymentDetails } =
      await orderPrintApi.apiOrderPrintNewOrderArtworkIdPost(
        artworkId,
        selectedSize
      );

    if (paymentDetails.type !== "StripePaymentIntent") {
      throw new Error(`${paymentDetails.type} payment not supported`);
    }

    return paymentDetails as StripePaymentIntent;
  }

  const imgExt = artwork.imageURL && artwork.imageURL.split(".").pop();
  const ogImages =
    (artwork.imageURL &&
      imgExt && [
        {
          url: artwork.imageURL,
          alt: artwork.label || "artwork",
          type: `image/${imgExt.toLowerCase()}`,
        },
      ]) ||
    [];

  return (
    <>
      <NextSeo
        title={`colourBox - ${artwork.label}`}
        description={`Artwork by ${artist.name}`}
        canonical={`https://colourbox.io/artworks/${artworkId}`}
        openGraph={{
          url: `https://colourbox.io/artworks/${artworkId}`,
          title: `colourBox - ${artwork.label}`,
          description: `Artwork by ${artist.name}`,
          images: ogImages,
          site_name: "colourBox",
        }}
      />
      <Box>
        {captureCrmReason && (
          <CaptureToCrmModal
            reason={captureCrmReason}
            onClose={() => setCaptureCrmReason(undefined)}
          />
        )}

        {showShipPrints && (
          <ShippingModal
            onCancel={() => setShowShipPrints(undefined)}
            getIntent={()=>printPayMentIntent()}
          />
        )}

        <Stack
          mx="auto"
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", md: "flex-start" }}
          spacing={{ xs: 2, lg: 4 }}
        >
          <Box
            sx={{
              maxWidth: "100%",
              overflowClipMargin: "content-box",
              overflow: "clip",
              mx: "auto",
            }}
          >
            <img
              src={artwork?.imageURL ?? ""}
              alt=""
              style={{ width: "100%", maxHeight: "70vh" }}
            />
          </Box>
          <Box
            sx={{
              maxWidth: "30rem",
              overflowClipMargin: "content-box",
              overflow: "clip",
            }}
          >
            <Typography variant="h3" mt={3}>
              {artwork?.label}
            </Typography>
            <Typography variant="h4" sx={{ opacity: 0.6 }}>
              {artist?.name}
            </Typography>
            <Link
              href="https://www.templeofcrystalorigins.com/"
              sx={{ fontSize: "15px" }}
              mb={2}
            >
              https://www.templeofcrystalorigins.com/
            </Link>

            <Box mb={12} mt={4}>
              <MarkdownPreview source={artwork?.description ?? ""} />

              <Divider light sx={{ my: 1 }} />

              {showPrintSizes && (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Select size
                  </Typography>
                  <Box sx={{ my: 1 }}>
                    <Select
                      fullWidth
                      size="small"
                      displayEmpty
                      value={selectedSale}
                      onChange={(e) => setSelectedSale(Number(e.target.value))}
                      renderValue={() => {
                        if (!selectedSale && selectedSale !== 0) {
                          return <em>Select a size</em>;
                        }

                        return (
                          <Typography>
                            {artwork?.saleDetails?.[selectedSale]?.size?.height}
                            cm x{" "}
                            {artwork?.saleDetails?.[selectedSale]?.size?.width}
                            cm -{" "}
                            <b>
                              {artwork?.saleDetails?.[selectedSale]?.price} €
                            </b>
                          </Typography>
                        );
                      }}
                      placeholder="Select a Size"
                      sx={{
                        overflowClipMargin: "content-box",
                        overflow: "clip",
                      }}
                    >
                      <MenuItem disabled value="">
                        <em>Select size</em>
                      </MenuItem>
                      {artwork?.saleDetails?.map((saleDetail, i) => (
                        <MenuItem value={i} key={i} sx={{ textAlign: "left" }}>
                          {saleDetail?.size?.height}cm x{" "}
                          {saleDetail?.size?.width}
                          cm - <b>{saleDetail?.price} €</b>
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </>
              )}
              <Stack direction="row" sx={{ height: "40px" }} spacing={1}>
                <Button
                  disabled={
                    showShipPrints ||
                    (showPrintSizes && !selectedSale && selectedSale !== 0)
                  }
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: "12px" }}
                  onClick={async () => {
                    if (!selectedSale && selectedSale !== 0) {
                      setShowPrintSize(true);
                    } else {
                      setShowShipPrints(true);
                    }
                  }}
                >
                  Purchase Print
                </Button>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                sx={{ borderRadius: "12px", my: 1.5, height: "40px" }}
                onClick={
                  () =>
                    setCaptureCrmReason(
                      `Purchase Original ${artworkId}`
                    ) /*router.push("/checkout")*/
                }
              >
                Purchase Original{" "}
                {artwork?.originalSize?.height
                  ? `| ${artwork?.originalSize?.height} cm x ${artwork?.originalSize?.width} cm`
                  : ""}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                sx={{ borderRadius: "12px", height: "40px" }}
                onClick={
                  () =>
                    setCaptureCrmReason(
                      `Purchase NFT ${artworkId}`
                    ) /*router.push("/checkout")*/
                }
              >
                Purchase NFT
              </Button>
              {/* <Box textAlign="right" my={1}>
							<Button
								onClick={() => router.push("/saved")}
								startIcon={<BookmarkAddIcon />}
							>
								Save for later
							</Button>
						</Box> */}
            </Box>
          </Box>
        </Stack>
        <Box my={4} sx={{ textAlign: "center" }}>
          <Typography variant="h4">Details</Typography>
          <Card
            variant="outlined"
            sx={{ p: 2, mt: "2rem", width: "fit-content", mx: "auto" }}
          >
            <CardContent>
              <Stack direction="column" spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Materials:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.7, textAlign: "right" }}
                  >
                    {artwork?.material
                      ? artwork?.material
                      : "Acrylic on canvas"}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Sizes available:
                  </Typography>

                  <Box>
                    {artwork?.saleDetails?.map((saleDetail, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ opacity: 0.7, textAlign: "right" }}
                      >
                        {saleDetail.size?.height} cm x {saleDetail.size?.width}{" "}
                        cm
                      </Typography>
                    ))}
                  </Box>
                </Stack>
                {/* <Stack direction="row" justifyContent="space-between" spacing={2}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									Rarity:
								</Typography>
								<Typography
									variant="body1"
									sx={{ opacity: 0.7, textAlign: "right" }}
								>
									Unique
								</Typography>
							</Stack>
							<Stack direction="row" justifyContent="space-between" spacing={2}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									Medium:
								</Typography>
								<Typography
									variant="body1"
									sx={{ opacity: 0.7, textAlign: "right" }}
								>
									Painting
								</Typography>
							</Stack> */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Signature:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.7, textAlign: "right" }}
                  >
                    Hand-signed by artist
                  </Typography>
                </Stack>
                {/* <Stack direction="row" justifyContent="space-between" spacing={2}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									Certificate of authenticity:
								</Typography>
								<Typography
									variant="body1"
									sx={{ opacity: 0.7, textAlign: "right" }}
								>
									Included (issued by gallery)
								</Typography>
							</Stack>
							<Stack direction="row" justifyContent="space-between" spacing={2}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									Frame:
								</Typography>
								<Typography
									variant="body1"
									sx={{ opacity: 0.7, textAlign: "right" }}
								>
									Not included
								</Typography>
							</Stack> */}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ArtworkInfoProps> = async ({
  query: { id },
  res,
}) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  const artworkApi = new ArtWorksApi(undefined, ServerURI.serverSide);
  /* const artistApi = new CreatorProfilesApi(
    undefined,
    ServerURI.clientSide
  ); */

  try {
    const { data: artwork } = await artworkApi.apiArtWorksArtworkidGet(
      id!.toString()
    );
    /* const { data: artistRestult } = await artistApi.apiCreatorProfilesCreatorprofileidGet(
      artwork?.creatorProfileId ?? ""
    ); */

    const artist: CreatorProfile = {
      name: "Bahar Acharjya",
    };

    return {
      props: {
        artwork: artwork,
        artist: artist,
      },
    };
  } catch (error) {
    console.error(
      `ERROR: artworks/ID/index:getServerSideProps failed to load artwork :${error}`
    );
    return {
      props: {},
    };
  }
};

export default ArtworkInfo;
