import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";
import { fetchFromNews } from "../services/news.service.js";
export async function searchNews(req, res) {
  const { query } = req.params;

  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const response = await fetchFromNews(
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${ENV_VARS.NEWS_API_KEY}`
    );

    if (!response.articles || response.articles.length === 0) {
      return res.status(404).send(null);
    }

    const firstResult = response.articles[0];

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        searchHistory: {
          id: firstResult.url,
          image: firstResult.urlToImage,
          title: firstResult.title,
          searchType: "news",
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({ success: true, content: response.articles });
  } catch (error) {
    console.log("Error in searchNews controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


export async function getSearchHistory(req, res) {
	try {
		res.status(200).json({ success: true, content: req.user.searchHistory });
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}

export async function removeItemFromSearchHistory(req, res) {
	let { id } = req.params;

	id = parseInt(id);

	try {
		await User.findByIdAndUpdate(req.user._id, {
			$pull: {
				searchHistory: { id: id },
			},
		});

		res.status(200).json({ success: true, message: "Item removed from search history" });
	} catch (error) {
		console.log("Error in removeItemFromSearchHistory controller: ", error.message);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}
