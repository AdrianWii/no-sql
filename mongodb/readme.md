## TASKS - BASIC QUERIES

1. Find all movies with a rating greater than 8.5:


```
db.movies.find({ rating: { $gt: 8.5 } });
```

2. Find all reviews written by a specific user (e.g., "user1"):

```
db.reviews.find({ user_id: 1 });
```

3. Find all movies that belong to a specific genre (e.g., "Crime"):

```
db.movies.find({ genre: "Crime" });
```

4. Find all users who have a movie in their favorites list with a specific genre (e.g., "Drama"):

```
db.users.find({ 
favorites: { $in: 
db.movies.find({ genre: "Drama" }).toArray().map(movie => movie._id) 
} 
});
```

5. Find all users who have watched a specific movie (e.g., movie with ID 1):

```
db.users.find({ watchlist: "1" })
```

6. Find all users who have "The Shawshank Redemption" in their favorites:

```
db.users.find({ favorites: 1 })
```

7. Find all users who have rated a movie:

```
db.users.find({ reviews: { $exists: true, $not: { $size: 0 } } })
```

8. Find all movies released after 2000 with the genre "Crime":

```
db.movies.find({ release_date: { $gt: "2000-01-01" }, genre: "Crime" })
```

9. Find the average rating of all movies:

```
db.movies.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }])
```

10. Find all users who have "The Godfather" in their watchlist but not in favorites:

```
db.users.find({ favorites: { $ne: 2 }, watchlist: 2 })
```

11. Find all movies with the genre "Action" and "Crime":

```
db.movies.find({ genre: { $all: ["Action", "Crime"] } })
```

12. Find all users who have not left any reviews:

```
db.users.find({ reviews: { $exists: false } })
```

13. Find all movies with a rating between 9.0 and 9.3:

```
db.movies.find({ rating: { $gte: 9.0, $lte: 9.3 } })
```

## TASKS - AGREGATION

1. Find all movies rated by a specific user (e.g., "user2"):

```
db.reviews.aggregate([
  { $match: { user_id: 1 } },
  { $lookup: { from: "movies", localField: "movie_id", foreignField: "_id", as: "movie" } },
  { $unwind: "$movie" },
  { $project: { _id: "$movie._id", title: "$movie.title", rating: 1 } }
]);
```


2. Calculate movies with genre comedy

```
db.movies.aggregate([
  {
    $match: {
      genre: "Comedy"
    }
  },
  {
    $group: {
      _id: null,
      count: { $sum: 1 }
    }
  }
])
```

or

```
db.movies.count({ genre: "Comedy" })
```

3. Calculate Movies count per day and Average Rate in given range

```
db.movies.aggregate([
    {
        $match: {
            release_date: {
                $gte: ISODate("YYYY-MM-DD"), // Start date of the range
                $lte: ISODate("YYYY-MM-DD")  // End date of the range
            }
        }
    },
    {
        $group: {
            _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$release_date" }
            },
            count: { $sum: 1 },
            average_rating: { $avg: "$rating" }
        }
    },
    {
        $sort: { _id: 1 } // Sort by date in ascending order
    }
])

```