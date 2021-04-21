#!/usr/bin/env sh
sleep 30; /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P root -d master -i init.sql
