import { ENV_VARS } from "../config/envVars.js";
import { fetchFromNews } from "../services/news.service.js";

export async function getTrending(req, res) {
  const user = req.user;
  console.log("[DEBUG] User Info:", user);

  try {
    const categories = user.preferredCategory;
    const totalCategories = categories.length;

    const limit = Math.min(totalCategories, 5);
    const selectedCategories = [...categories]
      .sort(() => 0.5 - Math.random()) // shuffle mảng
      .slice(0, limit); // chọn ngẫu nhiên tối đa 5 category

    const allArticles = [];

    for (const category of selectedCategories) {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category.trim()}&apiKey=${ENV_VARS.NEWS_API_KEY}`;
      const data = await fetchFromNews(url);
      const articles = data.articles?.slice(0, 5) || [];

      allArticles.push(...articles);
    }

    res.json({ success: true, content: allArticles });

  } catch (error) {
    console.error("[ERROR getTrendingNews]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}
export async function getByCategory(req, res) {
  try {
    const { category } = req.body;
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${ENV_VARS.NEWS_API_KEY}`;
    const data = await fetchFromNews(url);
    res.json({ success: true, content: data.articles });
  } catch (error) {
    console.error("[ERROR getByCategory]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}
export async function getBySource(req, res) {
  try {
    let { source } = req.body;
    if (!source || source.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Missing source",
      });
    }
    source = source.trim().toLowerCase().replace(/\s+/g, "-");
    const url = `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${ENV_VARS.NEWS_API_KEY}`;
    const data = await fetchFromNews(url);

    res.json({ success: true, content: data.articles });
  } catch (error) {
    console.error("[ERROR getBySource]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}



export async function search(req, res) {
  try {
    const { context } = req.body;

    if (!context || context.trim() === "") {
      return res.status(400).json({ success: false, message: "Missing context" });
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      context
    )}&language=en&pageSize=20&sortBy=relevancy&apiKey=${ENV_VARS.NEWS_API_KEY}`;

    const data = await fetchFromNews(url);

    res.json({ success: true, content: data.articles });
  } catch (error) {
    console.error("[ERROR search]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}
export async function getAllSources(req, res) {
  try {
    const url = `https://newsapi.org/v2/sources?apiKey=${ENV_VARS.NEWS_API_KEY}`;
    const data = await fetchFromNews(url);
    res.json({ success: true, content: data.sources });
  } catch (error) {
    console.error("[ERROR getAllSources]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}

export async function getEverything(req, res) {
  try {
    const { q, from, to, sortBy } = req.query;
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.append("q", q || "latest");
    if (from) url.searchParams.append("from", from);
    if (to) url.searchParams.append("to", to);
    if (sortBy) url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("apiKey", ENV_VARS.NEWS_API_KEY);

    const data = await fetchFromNews(url.toString());
    res.json({ success: true, content: data.articles });
  } catch (error) {
    console.error("[ERROR getEverything]", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Internal Server Error",
    });
  }
}