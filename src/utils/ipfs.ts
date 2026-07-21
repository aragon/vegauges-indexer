import { handlerContext } from "envio";
import { Cache } from "./cache";

async function fetchFromEndpoint<T>(endpoint: string, cid: string): Promise<T> {
  const response = await fetch(`${endpoint}/${cid}`);
  if (response.ok) {
    const metadata: any = await response.json();
    if (!metadata) {
      throw new Error(`No metadata found for ${cid}`);
    }
    return metadata;
  } else {
    throw new Error(`Unable to fetch ${cid} from ${endpoint}`);
  }
}

async function tryFetchIpfsFile<T>(
  cid: string,
  context: handlerContext,
): Promise<T> {
  const endpoints = [
    // we cycle through these endpoints to try ensure data availability
    // PINATA_IPFS_GATEWAY is an envio env var that can be set in your .env file, this is a paid gateway although doesn't always guarantee availability
    process.env.PINATA_IPFS_GATEWAY || "",
    "https://ipfs.io/ipfs",
  ];
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500; // in milliseconds

  for (const endpoint of endpoints.filter((n) => n)) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        return await fetchFromEndpoint<T>(endpoint, cid);
      } catch (error) {
        context.log.error(`Error fetching from endpoint ${endpoint}: ${error}`);
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * retries),
          );
        }
      }
    }
  }

  throw new Error("Unable to fetch from all endpoints");
}

export async function fetchIpfs<T>(
  cid: string,
  context: handlerContext,
): Promise<T> {
  const cache = await Cache.init();
  const _cid = cid.replace("ipfs://", "");

  const _metadata = await cache.read<T>(_cid);
  if (_metadata) {
    return _metadata;
  }

  const metadata = await tryFetchIpfsFile<T>(_cid, context);
  await cache.add(_cid, metadata);

  return metadata;
}
