# REDIS

# CONTEXT
1. [Operacje na ciągach znaków - zadania](#operacje)
    - [👤 System autoryzacyjny z wykorzystaniem tokenów](#operacje-1)
    - [👁️ System monitorowania zdarzeń](#operacje-2)
2. [Tablice asocjacyjne](#tablice-asocjacyjne)
3. [SET I SORTED SET - system oceniania artykułów](#sets)
4. [BITMAPY - przykład z rowerzystami](#bitmapy)
5. [HyperLogLog - unikalne elementy](#hll)
6. [Monitorowanie liczby odwiedzin na stronie internetowej](#monitorowanie)
7. [Prosta lista zadań do wykonania (to-do list)](#zadanie)

## Operacje na ciągach znaków - zadania
<a name="operacje"></a>

### 👤 System autoryzacyjny z wykorzystaniem tokenów 
<a name="operacje-1"></a>

Stwórz system autoryzacyjny, który generuje unikalne tokeny dla użytkowników po udanej autoryzacji. Przechowuj te tokeny jako ciągi znaków w Redisie. Zaimplementuj operacje dodawania, sprawdzania i usuwania tokenów.

1. Po udanej autoryzacji wygeneruj unikalny token, który będzie identyfikatorem sesji lub poświadczeniem użytkownika. Możesz wygenerować ten token na przykład za pomocą funkcji UUID

2. Użyj klucza w Redisie do przechowywania tokena

```
# Po udanej autoryzacji, wygeneruj unikalny token
SET token_value "user_id123456"

# Sprawdzenie, czy token istnieje
EXISTS token_value

# Pobranie tokenu
GET token_value

# Usunięcie tokenu
DEL token_value
```

###  👁️ System monitorowania zdarzeń 
<a name="operacje-2"></a>

Stwórz system monitorowania zdarzeń, który przechowuje zdarzenia jako ciągi znaków w Redisie. Każde zdarzenie mogłoby być zapisane jako pojedynczy ciąg znaków zawierający szczegóły zdarzenia. Zaimplementuj operacje dodawania nowych zdarzeń, pobierania zdarzeń na podstawie określonych kryteriów (np. przedział czasowy) oraz usuwania zdarzeń.

- zdarzenia są przechowywane jako ciągi znaków w Redisie
- zdarzenia przechowywane są w liście
- każde zdarzenie jest dodawane na początek listy, co pozwala na szybkie pobieranie najnowszych zdarzeń.

1. Dodawanie nowego zdarzenia:

```
LPUSH events "User 'John' logged in at 2024-02-21 10:00:00"
```

lub podobne:

```
LPUSH events "User 'Alice' logged in at 2024-02-21 09:00:00"
LPUSH events "User 'Bob' logged out at 2024-02-21 09:30:00"
LPUSH events "Error: Database connection lost"
LPUSH events "New user registered: 'Charlie'"
LPUSH events "Warning: Disk space is running low"
LPUSH events "User 'Dave' updated profile picture"
LPUSH events "User 'Eve' changed password"
LPUSH events "Scheduled maintenance started"
LPUSH events "System update available. Please restart."
LPUSH events "Server crashed unexpectedly"
```

2. Pobieranie zdarzeń na podstawie określonych kryteriów (np. przedział czasowy):

```
LRANGE events <start_index> <stop_index>
```

np. pobranie wszystkic zdarzeń zapisanych w kolejce.

```
LRANGE events 0 -1
```

3. Usuwanie zdarzeń:

```
LTRIM events <start_index> <stop_index>
```

np. komenda ograniczająca listę zdarzeń do 100 najnowszych.

```
LTRIM events 0 99
```

4. Pobranie z listy zdarzeń wszystkich ostrzeżeń


```
LRANGE events 0 -1
```

Jeśli korzystasz z Redis-cli, możesz przefiltrować zdarzenia zawierające słowo kluczowe "Warning", używając narzędzi dostępnych w terminalu, takich jak grep:

```
redis-cli LRANGE events 0 -1 | grep "Warning"
```


w node.js:


```
const redis = require('redis');

const client = redis.createClient();

client.on('error', function (err) {
    console.error('Błąd połączenia z Redisem:', err);
});

client.lrange('events', 0, -1, function (err, events) {
    if (err) {
        console.error('Błąd pobierania zdarzeń z Redis:', err);
        return;
    }

    const warningEvents = events.filter(event => event.includes('Warning'));

    warningEvents.forEach(event => {
        console.log(event);
    });
    client.quit();
});
```


## TABLICE ASOCJACYJNE
<a name="tablice-asocjacyjne"></a>

W Redisie nie ma struktur danych bezpośrednio zwanymi "tablice asocjacyjne", ale możemy osiągnąć podobne funkcjonalności za pomocą różnych typów danych Redis. Przykładowo, możemy użyć typu danych "Hash" do symulowania tablicy asocjacyjnej.


1. Dodawanie wartości do tablicy asocjacyjnej (Hash):

```
HSET users:user_id field_name value
```

np.

```
HSET users:123456 name "John"
```

2. Pobieranie wartości z tablicy asocjacyjnej (Hash):

```
HGET users:user_id field_name
```

np. 

```
HGET users:123456 name
```

3. Usuwanie wartości z tablicy asocjacyjnej (Hash):

```
HDEL users:user_id field_name
```

np.

```
HDEL users:123456 name
```

Przy użyciu typu danych Hash możemy tworzyć tablice asocjacyjne, gdzie każdy klucz reprezentuje identyfikator użytkownika, a wartość to zestaw pól i ich wartości.

3. SET I SORTED SET
<a name="sets"></a>
## System oceniania artykułów

Stwórzmy system oceniania artykułów online, w którym użytkownicy mogą oceniać artykuły i przeglądać najwyżej oceniane artykuły w określonym przedziale czasowym.

- Zbiór (set) do przechowywania ocen użytkowników dla każdego artykułu
- Każdy artykuł może mieć zbiór ocen od użytkowników. Kluczem jest identyfikator artykułu, a elementami są identyfikatory użytkowników, którzy ocenili artykuł
```
SADD article_ratings:article_id user_id1 user_id2 user_id3 ...
```

- Zbiór uporządkowany (sorted set) do przechowywania rankingu artykułów
- Użyjmy zbiory uporządkowanych, w których score będzie średnią ocen artykułów lub ich ilością. W przypadku oceniania od 1 do 5, możemy użyć średniej jako score.

```
ZADD top_articles:timestamp average_rating article_id
```

- Po każdej ocenie artykułu aktualizujemy ranking artykułów, dodając lub aktualizując ocenę w zbiorze uporządkowanym.
- Aby uzyskać najlepiej oceniane artykuły w określonym przedziale czasowym, pobieramy zestaw artykułów z posortowanego zbioru uporządkowanego dla danego przedziału czasowego.

### Rozwiązanie

Dodanie oceny dla artykułu:
```
SADD article_ratings:12345 user_id1
```

Aktualizacja rankingu artykułów po dodaniu oceny:

```
ZADD top_articles:timestamp average_rating 12345
```

Pobranie najlepiej ocenionych artykułów w określonym przedziale czasowym:

```
ZREVRANGE top_articles:timestamp 0 10 WITHSCORES
```

W tym przykładowym systemie użytkownicy mogą oceniać artykuły, a system automatycznie aktualizuje ranking najlepiej ocenianych artykułów, co pozwala użytkownikom na przeglądanie najbardziej popularnych treści w danym okresie czasu.



4. BITMAPY - przykład z rowerzystami
<a name="bitmapy"></a>


Załóżmy, że masz 1000 rowerzystów ścigających się przez wiejskie tereny, z czujnikami na ich rowerach oznaczonymi od 0 do 999. Chcesz szybko ustalić, czy dany czujnik wysłał sygnał do serwera śledzącego w ciągu godziny, aby sprawdzić pozycję rowerzysty.

Możesz przedstawić ten scenariusz za pomocą mapy bitowej, której klucz odnosi się do aktualnej godziny.

Rowerzysta 123 wysyła sygnał do serwera 1 stycznia 2024 roku w godzinie 00:00. Możesz potwierdzić, że rowerzysta 123 wysłał sygnał do serwera. Możesz również sprawdzić, czy rowerzysta 456 wysłał sygnał do serwera w tej samej godzinie.


```
> SETBIT pings:2024-01-01-00:00 123 1
(integer) 0
> GETBIT pings:2024-01-01-00:00 123
1
> GETBIT pings:2024-01-01-00:00 456
0
```

5. HyperLogLog

```
> PFADD bikes Hyperion Deimos Phoebe Quaoar
(integer) 1
> PFCOUNT bikes
(integer) 4
> PFADD commuter_bikes Salacia Mimas Quaoar
(integer) 1
> PFMERGE all_bikes bikes commuter_bikes
OK
> PFCOUNT all_bikes
(integer) 6
```


5. Monitorowanie liczby odwiedzin na stronie internetowej
<a name="monitorowanie"></a>

Utwórz klucz w Redis, który będzie przechowywał liczbę odwiedzin.
Za każdym razem, gdy ktoś odwiedza stronę, zwiększ wartość tego klucza o jeden.
Użyj Redis CLI, aby wyświetlić bieżącą liczbę odwiedzin.
Poniżej znajduje się przykładowe wykonanie zadania:

Utwórz klucz visits z początkową wartością 0:

```
SET visits 0
```

Za każdym razem, gdy ktoś odwiedza stronę, zwiększ wartość klucza visits o jeden:

```
INCR visits
```


Sprawdź liczbę odwiedzin:

```
GET visits

```

Możesz powtarzać kroki 2 i 3, aby śledzić rosnącą liczbę odwiedzin. Ta prosta aplikacja demonstrowałaby, jak wykorzystać Redis do śledzenia metryk w czasie rzeczywistym.


7. Prosta lista zadań do wykonania (to-do list)
<a name="zadanie"></a>

Utwórz listę zadań do wykonania za pomocą Redis.
Dodaj kilka zadań do listy.
Wyświetl listę zadań.
Oznacz pewne zadania jako wykonane.
Wyświetl zaktualizowaną listę zadań.
Usuń zadania z listy, które zostały wykonane.