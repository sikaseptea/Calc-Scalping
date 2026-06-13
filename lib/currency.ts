export async function getUsdRate() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=IDR"
    );

    const data = await res.json();

    return data.rates.IDR || 16385;
  } catch {
    return 16385;
  }
}