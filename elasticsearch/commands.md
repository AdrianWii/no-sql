## ELASTICSEARCH

# ANALYZE

The _analyze endpoint in Elasticsearch is used to analyze text and break it down into its constituent terms based on the analyzer configured for the field. Here are a few exercises involving the _analyze endpoint:

### 1. Tokenization - how text is tokenized using different analyzers.

Choose a text sample (e.g., a movie synopsis, review, or a random paragraph).
Use the _analyze endpoint to analyze the text with different analyzers (e.g., standard, whitespace, lowercase, etc.).
Compare the tokenization results obtained with each analyzer.

example:
```
GET _analyze
{
  "analyzer": "standard",
  "text": "The quick brown fox jumps over the lazy dog"
}
```

### 2. Custom Analyzer

Define a custom analyzer with specific token filters and character filters (e.g., lowercase, stop words removal, stemming, etc.).
Apply the custom analyzer to a text sample and observe the tokenization results.

example:

```PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom", 
          "tokenizer": "standard",
          "char_filter": [
            "html_strip"
          ],
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_custom_analyzer",
  "text": "Is this <b>déjà vu</b>?"
}
```
or

```
GET _analyze
{
  "analyzer": "my_custom_analyzer",
  "text": "The quick brown fox jumps over the lazy dog"
}
```

### 3. Edge N-gram 

Use the edge n-gram tokenizer to analyze a text sample.
Explore how edge n-grams are generated based on different configurations (e.g., min and max gram sizes).
With the default settings, the edge_ngram tokenizer treats the initial text as a single token and produces N-grams with minimum length 1 and maximum length 2:

```
POST _analyze
{
  "tokenizer": "edge_ngram",
  "text": "Quick Fox"
}
```

give:

```[ Q, Qu ]```

example:

```
PUT ngram
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": [
            "letter",
            "digit"
          ]
        }
      }
    }
  }
}

POST ngram/_analyze
{
  "analyzer": "my_analyzer",
  "text": "2 Quick Foxes."
}
```


### 4. Synonym Analyzer - Analyze text using a synonym
Define a synonym tokenizer with a list of synonyms.
Apply the synonym tokenizer to a text sample and observe how synonyms are expanded.

This is a little bit harder analyzer. Let's check whole configuration [here](https://medium.com/version-1/synonyms-in-elasticsearch-c527280ba8a5).

### 5. Stopwords Exercise -  stopwords removal

Analyze a text sample with and without stopwords removal.
Compare the tokenization results to observe the impact of stopwords on the analysis.

```
GET _analyze
{
  "tokenizer": "standard",
  "text": "The quick brown fox jumps over the lazy dog",
  "filter": ["lowercase", "stop"]
}
```