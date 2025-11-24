"""
Django configuration package.
This module configures PyMySQL to work with Django's MySQL backend.
"""

import pymysql

# Monkey-patch PyMySQL to work with Django's MySQL backend
pymysql.install_as_MySQLdb()

