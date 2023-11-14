import { NFTStorage,File } from "nft.storage";

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY || "";

const client = new NFTStorage({ token: NFT_STORAGE_KEY });

export async function POST(request: Request) {
    const json = await request.json();
    const jsonFile= new File([JSON.stringify(json)],"test.json",{type:"application/json"})
    const cid = await client.storeBlob(jsonFile);
    return Response.json(cid)
}
