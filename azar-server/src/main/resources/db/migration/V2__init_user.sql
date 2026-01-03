INSERT INTO USERS (id, first_name, last_name, user_name, password, user_type)
VALUES (1, 'temp_admin', 'temp_admin', 'temp_admin', '$2a$10$c4I1DhFHttVElfxgH8F2ouBWnXREYfTx9V2IUvh3QI4ttZciuym/a', 'ADMIN');

ALTER sequence users_id_seq restart with 2;
