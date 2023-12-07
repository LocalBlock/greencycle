import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cid = searchParams.get("cid");

  // Url with geteway, eg: https://bafkreihesl4xkmm34wj5eywgllpoz4jpntuf4cytdgsoukr3pwrgmiezte.ipfs.nftstorage.link/
  const ipfsGatewayURI = "https://" + cid + ".ipfs.nftstorage.link/"; 

  const res = await fetch(ipfsGatewayURI, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  const data = await res.json();
  return Response.json(data);
}
