CREATE TABLE IF NOT EXISTS "account_data" ("id" text NOT NULL,"json" text NOT NULL,"updateAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "album" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "artist_album" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "artist" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "audio" ("id" integer NOT NULL,"br" int NOT NULL,"type" text NOT NULL,"srouce" text NOT NULL,"updateAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "lyric" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" integer NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "playlist" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "track" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS "cover_color" ("id" integer NOT NULL,"color" text NOT NULL, PRIMARY KEY (id));
