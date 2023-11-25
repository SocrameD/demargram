MATCH (n:pessoas) RETURN n LIMIT 25

MATCH (a:pessoas {uuid: '0852aa53-d2b9-4521-a19f-eec40ee09464'})-[r:Amigo]->(b:pessoas)
RETURN a,b;

MATCH (p:pessoas)-[r:Amigo]->(friend:pessoas)
RETURN friend.name;
