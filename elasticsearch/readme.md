# ELASTICSEARCH

1. [Pierwsze kroki](#first-steps)
2. [Dodawanie i wyszukiwanie w Elasticsearch](#manipulation)
3. [Wyszukiwanie](#search)
4. [Analizatory](#analizatory)

## Pierwsze kroki <a name="first-steps" id="first-steps"></a>

```
PUT example

POST example/_doc 
{
  "title": "The Polar Express",
  "release": 2004,
  "director": "Robert Zemeckis"
}

// failed to parse field
POST example/_doc 
{
  "title": "The Polar Express",
  "release": 2004,
  "director": "Robert Zemeckis"
}

GET example


DELETE example
```

## Dodawanie i wyszukiwanie w Elasticsearch <a name="manipulation" id="manipulation"></a>

Utwórz endpoint POST, który pozwoli na dodawanie danych filmów do Elasticsearch. Każdy film powinien zawierać informacje takie jak `title`, `release`, `director`, `rating`.

Przykładowe dane JSON do dodania filmów:

```
PUT movies/_doc/1
{
  "title": "Incepcja",
  "release": "2010",
  "director": "Christopher Nolan",
  "rating": 8.8
}

PUT movies/_doc/2
{
  "title": "Interstellar",
  "release": "2014",
  "director": "Christopher Nolan",
  "rating": 8.6
}

PUT movies/_doc/3
{
  "title": "The Dark Knight",
  "release": "2008",
  "director": "Christopher Nolan",
  "rating": 9.0
}

PUT movies/_doc/4
{
  "title": "The Prestige",
  "release": "2006",
  "director": "Christopher Nolan",
  "rating": 8.5
}

PUT movies/_doc/5
{
  "title": "The Dark Knight Rises",
  "release": "2012",
  "director": "Christopher Nolan",
  "rating": 8.4
}

PUT movies/_doc/6
{
  "title": "Memento",
  "release": "2000",
  "director": "Christopher Nolan",
  "rating": 8.4
}

PUT movies/_doc/7
{
  "title": "Star Wars: The Last Jedi",
  "release": "2017",
  "director": "Rian Johnson",
  "rating": 7.0
}

PUT movies/_doc/8
{
  "title": "Avengers: Infinity War",
  "release": "2018",
  "director": "Anthony Russo, Joe Russo",
  "rating": 8.4
}

PUT movies/_doc/9
{
  "title": "The Light Between Oceans",
  "release": "2016",
  "director": "Derek Cianfrance",
  "rating": 7.2
}

PUT movies/_doc/10
{
  "title": "The Lord of the Rings: The Fellowship of the Ring",
  "release": "2001",
  "director": "Peter Jackson",
  "rating": 8.8
}
```


Utwórz endpoint POST, który pozwoli na wyszukiwanie filmów w Elasticsearch na podstawie różnych kryteriów, takich jak tytuł, reżyser, rok wydania itp.

Przykładowe zapytanie JSON do wyszukiwania filmów:

```
POST movies/_search
{
  "query": {
    "match": {
      "title": "Inception"
    }
  }
}
```

## WYSZUKWANIE <a name="search" id="search"></a>

Znajdź wszystkie filmy, których tytuł zawiera podane słowo kluczowe.

```
{
  "query": {
    "match": {
      "title": "Inception"
    }
  }
}
```

Znajdź wszystkie filmy, których reżyser zawiera podane imię lub nazwisko.

```
{
  "query": {
    "match": {
      "director": "Christopher Nolan"
    }
  }
}
```

Znajdź wszystkie filmy wydane w określonym roku.

```
{
  "query": {
    "match": {
      "release": "2010"
    }
  }
}
```

Znajdź wszystkie filmy, których ocena jest wyższa niż podana wartość.


```
{
  "query": {
    "range": {
      "rating": {
        "gte": 8.0
      }
    }
  }
}
```

Znajdź wszystkie filmy, których tytuł lub reżyser zawiera podane słowo kluczowe.

```
{
  "query": {
    "multi_match": {
      "query": "Nolan",
      "fields": ["title", "director"]
    }
  }
}
```

## ANALIZATORY <a name="analyze" id="analyze"></a>

Endpoint _analyze w Elasticsearch służy do analizowania tekstu i dzielenia go na terminy składowe w oparciu o analizator skonfigurowany dla pola.

Porównaj analizatory.

```
GET _analyze
{
  "text": "The quick brown fox jumps over the lazy dog"
}


GET _analyze
{
  "text": "The quick brown fox jumps over the lazy dog",
  "analyzer": "keyword"
}
```

Analizator `english`, do tekstu została uyta liczba mnoga `dogs`.

```
GET _analyze
{
  "text": "The quick brown fox jumps over the lazy dogs",
  "analyzer": "english"
}
```

### 1. Tokenization - jak tekst jest tokenizowany przy użyciu różnych analizatorów.

Wybierz próbkę tekstu (np. streszczenie filmu, recenzję lub losowy akapit).
Użyj endpointu _analyze, aby przeanalizować tekst za pomocą różnych analizatorów (np. standardowego, białych znaków, małych liter itp.).
Porównaj wyniki tokenizacji uzyskane za pomocą każdego analizatora.

```
GET _analyze
{
  "analyzer": "standard",
  "text": "The quick brown fox jumps over the lazy dog"
}
```

### 2. Custom Analyzer

Zdefiniuj niestandardowy analizator z określonymi filtrami tokenów i filtrami znaków (np. małe litery, usuwanie słów stop, stemming itp.).
Zastosuj niestandardowy analizator do próbki tekstu i obserwuj wyniki tokenizacji.

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
lub

```
GET _analyze
{
  "analyzer": "my_custom_analyzer",
  "text": "The quick brown fox jumps over the lazy dog"
}
```

### 3. Edge N-gram 

Użyj tokenizatora n-gramów krawędziowych do analizy próbki tekstu.
Zbadaj, w jaki sposób generowane są n-gramy krawędziowe w oparciu o różne konfiguracje (np. minimalne i maksymalne rozmiary gramów).
Przy ustawieniach domyślnych tokenizer edge_ngram traktuje tekst początkowy jako pojedynczy token i tworzy N-gramy o minimalnej długości 1 i maksymalnej długości 2:

```
POST _analyze
{
  "tokenizer": "edge_ngram",
  "text": "Quick Fox"
}
```

rezultat:

```[ Q, Qu ]```



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


### 4. Synonym Analyzer - Analizowanie tekstu przy użyciu synonimów
Zastosuj tokenizator synonimów do próbki tekstu i obserwuj, jak synonimy są rozszerzane.

Jest to nieco trudniejszy analizator. Sprawdźmy całą konfigurację [tutaj](https://medium.com/version-1/synonyms-in-elasticsearch-c527280ba8a5).

### 5. Stopwords -  usuwanie słów stopu

Przeanalizuj próbkę tekstu z usuniętymi słowami stop i bez nich.
Porównaj wyniki tokenizacji, aby zaobserwować wpływ słów stop na analizę.

```
GET _analyze
{
  "tokenizer": "standard",
  "text": "The quick brown fox jumps over the lazy dog",
  "filter": ["lowercase", "stop"]
}
```

