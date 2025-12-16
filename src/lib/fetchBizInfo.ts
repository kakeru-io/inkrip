export async function fetchBizInfo() {
	const url =
		"https://raw.githubusercontent.com/bitboxx-inc/bitboxx-public/refs/heads/main/bizinfo.json";

	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch bizinfo.json");

	return await res.json();
}