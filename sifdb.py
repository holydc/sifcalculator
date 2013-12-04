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
    self._data = None
    self._rowspan = None

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

  def handle_starttag(self, tag, attrs):
    self._tag.append(tag)
    if (self._table != None):
      if (tag == 'table'):
        self._rowspan = {}
        # TODO: create table
      if (tag == 'tr'):
        self._record = []
      elif (tag == 'td'):
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
            self._record.append('')

  def handle_endtag(self, tag):
    self._tag.pop()
    if (self._table != None):
      if (tag == 'table'):
        self._table = None
        self._rowspan = None
      elif (tag == 'tr'):
        # check trailing rowspan
        self.appendRowspan()

        # the first column should be number
        if self._record[0].isdigit():
          self._record.append(self._table)
          # TODO: insert record into database
          print(len(self._record))
          print(self._record)
        self._record = None
      elif (tag == 'td'):
        # record for rowspan
        if len(self._record) in self._rowspan.keys():
          rowspan = self._rowspan[len(self._record)]
          if (rowspan[1] == None):
            rowspan[1] = self._data

        self._record.append(self._data)
        self._data = None

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
        print('h2: %s' % self._table)
    elif (self._record != None):
      tags = ('td', 'a', 'strong', 'span')
      if self._tag[-1] in tags:
        if (data_ == '-'):
          data_ = ''
        self.appendData(data_)

#res = urllib.request.urlopen('http://www56.atwiki.jp/bushimolovelive/pages/30.html')
#body = codecs.decode(res.read())
page = open('page.txt', 'r')
body = page.read()
page.close()
parser = SifParser()
parser.feed(body)

