import sodium from "libsodium-wrappers-sumo";

let readyPromise: Promise<typeof sodium> | null = null;

export async function getSodium() {
  if (!readyPromise) {
    readyPromise = sodium.ready.then(() => sodium);
  }

  return readyPromise;
}
