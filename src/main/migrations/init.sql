CREATE TABLE "artist" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "album" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "playlist" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "track" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "artist_album" ("id" integer NOT NULL,"json" text NOT NULL,"updatedAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "audio" ("id" integer NOT NULL,"br" int NOT NULL,"type" text NOT NULL,"srouce" text NOT NULL,"updateAt" int NOT NULL, PRIMARY KEY (id));
CREATE TABLE "account_data" ("id" text NOT NULL,"json" text NOT NULL,"updateAt" int NOT NULL, PRIMARY KEY (id));
