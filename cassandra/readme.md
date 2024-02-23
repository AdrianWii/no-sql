# CASSANDRA

# CONTEXT
1. [KORZYSTANIE Z CQLSH](#cqlsh)
2. [MOVIE DATABASE](#movie-database)
3. [INDEX](#indx)
4. [BATCH](#batch)
5. [Wykorzystanie TTL w operacjach na danych](#ttl)
6. [Wykorzystanie wyzwalaczy do monitorowania i modyfikowania danych](#trigger)
7. [KOPIOWANIE](#copy)

## KORZYSTANIE Z CQLSH
<a name="cqlsh"></a>

### 1. Wyświetlenie wersji CQLSH:
Uruchom CQLSH i wyświetl wersję CQLSH, która jest aktualnie zainstalowana.

```
cqlsh --version
```

### 2. Aktywacja kolorów:
Uruchom CQLSH, aktywując kolorowanie wyników zapytań.

```
cqlsh --color
```

### 3. Informacje o klastrze

Po połączeniu z CQLSH, wyświetl informacje o klastrze, w tym o wersji Cassandry oraz adresach węzłów klastra.

```
DESCRIBE CLUSTER
```

### 4. Wyświetlenie schematu bazy danych:
Wyświetl schemat bazy danych `system_schema` w celu zrozumienia struktury danych w systemie.

```
DESCRIBE KEYSPACES;
```

```
USE system_schema;
DESCRIBE TABLES;
```


## MOVIE DATABASE
<a name="movie-database"></a>

Utwórz tabelę w bazie danych Cassandra za pomocą CQLSH, która będzie przechowywać informacje o filmach. Dodaj kilka rekordów do tej tabeli, wykonaj zapytanie, aby uzyskać wyniki i przeprowadź aktualizację jednego z rekordów.


### 1. Tworzenie tabeli
Uruchom CQLSH i utwórz nową przestrzeń kluczy oraz tabelę dla danych o filmach.

```
cqlsh
```

```
CREATE KEYSPACE IF NOT EXISTS movies_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};
```

Pamiętaj aby ustawić aktualny keyspace:

```
USE movies_keyspace;
```

i utwórz tabelę definiująca strukturę przechowywanych filmów:

```
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY,
    title TEXT,
    director TEXT,
    release_year INT,
    genre TEXT
);
```

### 2. Dodawanie rekordów
Dodaj kilka rekordów do tabeli movies.

```
INSERT INTO movies (id, title, director, release_year, genre) VALUES (uuid(), 'Inception', 'Christopher Nolan', 2010, 'Sci-Fi');

INSERT INTO movies (id, title, director, release_year, genre) VALUES (uuid(), 'The Shawshank Redemption', 'Frank Darabont', 1994, 'Drama');
```


### 3. Wykonanie zapytania
Wykonaj zapytanie, aby uzyskać listę wszystkich filmów w tabeli movies.

```
SELECT * FROM movies;
```


### 4. Aktualizacja rekordu
Zaktualizuj jedno z istniejących rekordów, np. zmień rok premiery filmu "Incepcja" na 2012.

```
UPDATE movies SET release_year = 2012 WHERE title = 'Inception';
```

### 5. Sprawdzenie zaktualizowanego rekordu
Sprawdź, czy aktualizacja została wykonana poprawnie.

```
SELECT * FROM movies WHERE title = 'Inception';
```

### TWORZENIE INDEKSU
<a name="indx"></a>

Utwórz indeks na kolumnie director, aby umożliwić szybkie wyszukiwanie filmów według reżysera.

```
CREATE INDEX IF NOT EXISTS director_index ON movies (director);

```
Modyfikacja indeksu przy użyciu polecenia ALTER INDEX:
Zmodyfikuj indeks director_index, np. zmieniając jego nazwę.

```
ALTER INDEX director_index RENAME TO new_director_index;
```

### BATCH
<a name="batch"></a>

Aktualizacja filmu i wykorzystanie BATCH

Zaktualizuj informacje o filmie, na przykład zmień rok wydania filmu "Incepcja" na 2012, wykorzystując BATCH w celu gwarancji atomowości operacji.

```
BEGIN BATCH
UPDATE movies SET release_year = 2012 WHERE title = 'Inception';
APPLY BATCH;
```

<a name="ttl"></a>
### Wykorzystanie TTL w operacjach na danych


Utwórz przestrzeń kluczy session_keyspace oraz tabelę sessions, która będzie przechowywać informacje o sesjach użytkowników, takie jak session_id, user_id, login_time.

```
CREATE KEYSPACE IF NOT EXISTS session_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE session_keyspace;

CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID,
    login_time TIMESTAMP,
    -- Wprowadź TTL dla kolumny 'login_time'
    -- Wartość TTL jest wyrażona w sekundach
    -- W poniższym przykładzie ustawiamy TTL na 3600 sekund (1 godzina)
    login_time TTL
);
```

Dodaj rekordy do tabeli sessions zawierające informacje o sesjach użytkowników.


```
INSERT INTO sessions (session_id, user_id, login_time) VALUES (uuid(), uuid(), toTimestamp(now()));
INSERT INTO sessions (session_id, user_id, login_time) VALUES (uuid(), uuid(), toTimestamp(now()));
```

Wyświetl informacje o sesjach użytkowników, aby sprawdzić, czy zostały dodane poprawnie.

`SELECT * FROM sessions;`


Zaktualizuj TTL dla sesji, na przykład ustawiając TTL na 1800 sekund (pół godziny) dla konkretnej sesji.


```
UPDATE sessions USING TTL 1800 SET login_time = toTimestamp(now()) WHERE session_id = <session_id>;
```

Po upływie ustalonego czasu sprawdź, czy sesja została automatycznie usunięta z bazy danych.


```
SELECT * FROM sessions WHERE session_id = <session_id>;

```


<a name="trigger"></a>
### Wykorzystanie wyzwalaczy do monitorowania i modyfikowania danych

Utwórz przestrzeń kluczy transaction_keyspace oraz tabelę transactions, która będzie przechowywać informacje o transakcjach, takie jak transaction_id, user_id, amount, timestamp.

```
CREATE KEYSPACE IF NOT EXISTS transaction_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE transaction_keyspace;

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY,
    user_id UUID,
    amount DECIMAL,
    timestamp TIMESTAMP
);
```

Utwórz wyzwalacz, który będzie monitorował dodawanie nowych transakcji do tabeli transactions i wykona określone akcje w zależności od warunków.


```
CREATE OR REPLACE TRIGGER transaction_trigger
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    -- Przykładowa akcja: Zapisanie informacji o transakcji do innego logu lub tabeli
    INSERT INTO transaction_logs (transaction_id, user_id, amount, timestamp)
    VALUES (NEW.transaction_id, NEW.user_id, NEW.amount, NEW.timestamp);
END;
```

Dodaj kilka nowych transakcji do tabeli transactions.

```
INSERT INTO transactions (transaction_id, user_id, amount, timestamp) VALUES (uuid(), uuid(), 100.00, toTimestamp(now()));
INSERT INTO transactions (transaction_id, user_id, amount, timestamp) VALUES (uuid(), uuid(), 50.00, toTimestamp(now()));
```

Sprawdź, czy wyzwalacz działa poprawnie, wyświetlając logi transakcji w tabeli transaction_logs.


```SELECT * FROM transaction_logs;```

Zmodyfikuj wyzwalacz, dodając warunki lub inne akcje, w zależności od potrzeb.

```ALTER TRIGGER transaction_trigger
ADD CONDITION IF ... THEN ...;
```


### COPY

Po uruchomieniu CQLSH, możesz użyć polecenia COPY do kopiowania danych między plikiem a tabelą w bazie danych Cassandra. Na przykład, aby skopiować dane z pliku CSV do tabeli, wpisz polecenie:

```
COPY keyspace_name.table_name (column1, column2, ...) FROM 'file_path' WITH DELIMITER=',' AND HEADER=true;
```

lub aby eksportować dane z tabeli do pliku CSV:

```
COPY keyspace_name.table_name (column1, column2, ...) TO 'file_path' WITH DELIMITER=',' AND HEADER=true;
```

Upewnij się, że zastąpiłeś keyspace_name, table_name i file_path odpowiednimi wartościami w Twoim środowisku. Dodatkowo, pamiętaj o uprawnieniach dostępu do plików i odpowiedniej konfiguracji środowiska.



Pamiętaj, że plik musi być dostępny w systemie plików na maszynie, na której działa instancja Cassandra w kontenerze Docker. Możesz skopiować plik do kontenera za pomocą narzędzia docker cp, jeśli plik znajduje się na twoim lokalnym systemie plików. Na przykład:

```
docker cp /path/to/local/file.csv cassandra-1:/path/to/container/file.csv
```