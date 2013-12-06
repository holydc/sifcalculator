#! /usr/bin/python3

import codecs
import html.parser
import re
import sqlite3
import urllib.request

class SifParser(html.parser.HTMLParser):
  def __init__(self):
    super().__init__()
    self._tag = [None]
    self._table = None
    self._record = None
    self._records = None
    self._data = None
    self._rowspan = None

    # database
    self._db = sqlite3.connect('sif.db')
    c = self._db.cursor()
    c.execute('DROP TABLE IF EXISTS sif')
    c.execute(
        'CREATE TABLE sif('
        '_no INTEGER NOT NULL PRIMARY KEY, '
        'img VARCHAR(255), '
        'name VARCHAR(255) NOT NULL, '
        'type VARCHAR(7) NOT NULL, '
        'stamina INTEGER, '
        'smile INTEGER, '
        'pure INTEGER, '
        'cool INTEGER, '
        'max_stamina INTEGER, '
        'max_smile INTEGER, '
        'max_pure INTEGER, '
        'max_cool INTEGER, '
        'final_max_stamina INTEGER, '
        'final_max_smile INTEGER, '
        'final_max_pure INTEGER, '
        'final_max_cool INTEGER, '
        'skill VARCHAR(255), '
        'center_skill VARCHAR(255), '
        'rarity VARCHAR(7) NOT NULL'
        ')')
    self._db.commit()
    c.close()

  def appendData(self, data):
    if (len(self._data) == 0):
      self._data = data
    elif (len(data) > 0):
      self._data = '%s<br />%s' % (self._data, data)

  def appendRowspan(self):
    while len(self._record) in self._rowspan.keys():
      rowspan = self._rowspan[len(self._record)]
      self._record.append(rowspan[1])
      rowspan[0] -= 1
      if (rowspan[0] == 0):
        rowspan = None
        self._rowspan.pop(len(self._record) - 1)

  def insertRecord(self):
    query = None
    if (self._table == 'N'):
      query = (
          'INSERT INTO sif (_no, img, name, type, stamina, smile, pure, cool, final_max_stamina, final_max_smile, final_max_pure, final_max_cool, rarity) '
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    else:
      query = (
          'INSERT INTO sif '
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    c = self._db.cursor()
    for record in self._records:
      c.execute(query, record)
    self._db.commit()
    c.close()

  def handle_starttable(self):
    self._rowspan = {}
    self._records = []

  def handle_endtable(self):
    self.insertRecord()
    self._table = None
    self._rowspan = None
    self._records = None

  def handle_starttr(self):
    self._record = []

  def handle_endtr(self):
    # check trailing rowspan
    self.appendRowspan()

    # the first column should be number
    if (self._record[0] != None) and (self._record[0].isdigit()):
      self._record.append({
        'N'  : 1,
        'R'  : 3,
        'SR' : 5,
        'UR' : 7
      }.get(self._table, None))
      self._records.append(tuple(self._record))
    self._record = None

  def handle_starttd(self, attrs):
    self._data = ''
    colspan = None

    # append data for rowspan
    self.appendRowspan()

    # check colspan and rowspan
    for attr in attrs:
      if (attr[0] == 'colspan'):
        colspan = int(attr[1])
      elif (attr[0] == 'rowspan'):
        self._rowspan[len(self._record)] = [int(attr[1]) - 1, None]
    if (colspan != None):
      for i in range(1, colspan):
        self._record.append(None)

  def handle_endtd(self):
    # record for rowspan
    if len(self._record) in self._rowspan.keys():
      rowspan = self._rowspan[len(self._record)]
      if (rowspan[1] == None):
        rowspan[1] = self._data

    if (len(self._data) == 0):
      self._data = None
    self._record.append(self._data)
    self._data = None

  def handle_starttag(self, tag, attrs):
    self._tag.append(tag)
    if (self._table != None):
      if (tag == 'table'):
        self.handle_starttable()
      if (tag == 'tr'):
        self.handle_starttr()
      elif (tag == 'td'):
        self.handle_starttd(attrs)

  def handle_endtag(self, tag):
    self._tag.pop()
    if (self._table != None):
      if (tag == 'table'):
        self.handle_endtable()
      elif (tag == 'tr'):
        self.handle_endtr()
      elif (tag == 'td'):
        self.handle_endtd()

  def handle_startendtag(self, tag, attrs):
    if (self._record != None) and (tag == 'img'):
      for attr in attrs:
        if (attr[0] == 'src'):
          self.appendData(attr[1])

  def handle_data(self, data):
    data_ = data.strip(' \r\n\t')
    if (self._tag[-1] == 'h2'):
      m = re.match(r'\[(\w+)\]部員', data_)
      if (m != None):
        self._table = m.groups()[0]
    elif (self._record != None):
      tags = ('td', 'a', 'strong', 'span')
      if self._tag[-1] in tags:
        if (data_ == '-'):
          data_ = ''
        self.appendData(data_)

#res = urllib.request.urlopen('http://www56.atwiki.jp/bushimolovelive/pages/30.html')
#body = codecs.decode(res.read())
#print('page loaded, write to file')
#f = open('sif.txt', 'w')
#f.write(body)
#f.close()
f = open('sif.txt', 'r')
body = f.read()
print('page read from file')
f.close()
parser = SifParser()
print('start to parse')
parser.feed(body)

