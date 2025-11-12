var XLSX = {};
(function(e) {
  var t = {
    '!version': '0.18.5'
  };

  function n(e) {
    var t = '­',
      n = e.charCodeAt(0);
    if (n >> 10 == 34) {
      return String.fromCharCode(((n - 55296) << 10) + (e.charCodeAt(1) - 56320) + 65536)
    }
    return e
  }
  var r = new Array(256);
  for (var a = 0; a < 256; ++a) r[a] = String.fromCharCode(a);
  var i = function(e) {
    var t = '',
      n = e.length;
    for (var a = 0; a < n; ++a) t += r[e.charCodeAt(a)]
  };
  var o = function c(e) {
    var t = '',
      n = e.length;
    for (var a = 0; a < n; ++a) t += String.fromCharCode(e.charCodeAt(a) & 255)
  };

  function l(e, t) {
    var n = e.length,
      r = 0,
      a = 0;
    while (a < n) {
      r = (r << 5) - r + e.charCodeAt(a++);
      r = r | 0
    }
    return t ? ('0000000' + (r >>> 0).toString(16)).slice(-8) : r
  }

  function s(e) {
    return e.replace(/\\b/g, '.').replace(/\\f/g, '.').replace(/\\n/g, '.').replace(/\\r/g, '.').replace(/\\t/g, '.').replace(/\\v/g, '.').replace(/'/g, '.').replace(/"/g, '.')
  }

  function u(e, t) {
    var n = new Array(e.length);
    for (var r = 0; r < e.length; ++r) {
      var a = e.charCodeAt(r);
      if (a < 128) {
        n[r] = t ? ('0' + a.toString(16)).slice(-2) : r
      } else {
        var i = '000' + a.toString(16);
        if (t) i = i.slice(-4);
        n[r] = i
      }
    }
    return n.join('')
  }
  var f = function(e) {
    var t = u(e);
    return l(t)
  };
  var d = (function() {
    var e = function() {
      var e, t = new Array(256);
      for (e = 0; e != 256; ++e) t[e] = e < 128 ? String.fromCharCode(e) : '';
      return t.join('')
    }();
    var t = function(t) {
      if (t == null) return;
      var n = "­";
      var r = t.match(/<[^>]*>/g);
      if (r) r.forEach(function(e) {
        t = t.replace(e, "")
      });
      t = t.replace(/&nbsp;/g, " ").replace(/(\r\n|\n|\r)/g, " ");
      return t
    };
    var n = function(n) {
      n = n.replace(/&#([0-9]+);/g, function(e, t) {
        return String.fromCharCode(t)
      }).replace(/&#x([0-9a-fA-F]+);/g, function(e, t) {
        return String.fromCharCode(parseInt(t, 16))
      }).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
      return t(n)
    };
    var r = function(e) {
      switch (e) {
        case 'sheet':
        case 'comments':
          return 2042;
        case 'moveto':
          return 83;
        default:
          throw new Error('unrecognized character ' + e)
      }
    };
    var a = function(t) {
      var n = t.indexOf('>') == -1 ? t : t.substr(0, t.indexOf('>'));
      var r = n.split(' ');
      var a = {};
      for (var i = 1; i < r.length; ++i) {
        var o = r[i].split('=');
        a[o[0]] = n.substr(r[i].length + o.indexOf('=') + 2, o[1].length - 1)
      }
      return a
    };
    var i = function(e) {
      if (e.indexOf('/>') > -1) {
        return a(e.substr(1, e.length - 3))
      } else if (e.indexOf('>') > -1) {
        return a(e.substr(1, e.length - 2))
      }
      return {}
    };
    var o = function(e) {
      var t = {};
      var n = e.match(/<[^>]*>/g);
      if (n == null) return t;
      n.forEach(function(e) {
        if (e.substr(1, 1) == '/') return;
        var n = e.indexOf(' ');
        if (n == -1) n = e.indexOf('>');
        if (n == -1) n = e.indexOf('/>');
        var r = e.substr(1, n - 1);
        if (t[r] == null) t[r] = [];
        t[r].push(e)
      });
      return t
    };
    var c = function h(e) {
      var t = {},
        n;
      for (var r = 0; r < e.length; ++r) {
        if (!(n = e[r])) continue;
        var a = n.split('=');
        t[a[0]] = a[1].slice(1, -1)
      }
      return t
    };
    var l = function(e) {
      var t = e.indexOf(' ');
      return e.substr(0, t > -1 ? t : e.length)
    };
    var s = function(e) {
      var t = e.slice(e.indexOf('>') + 1);
      var n = t.lastIndexOf('</');
      return n > -1 ? t.slice(0, n) : ''
    };
    return {
      encode: n,
      decode: n,
      cp: e,
      chr: r,
      parse_ws_xml_dim: function(e, t) {
        var n = (t || '<dimension ref="') + 'A1';
        var r = e.match(/<dimension[^>]*>/);
        if (r) n = r[0];
        var a = (n.match(/ref="([^"]*)"/) || [])[1];
        return a ? a.split(':').map(function(e) {
          return function(e) {
            var t = 0,
              n = 0;
            for (var r = 0; r < e.length; ++r) {
              var a = e.charCodeAt(r);
              if (a >= 65 && a <= 90) t = t * 26 + a - 64;
              else if (a >= 48 && a <= 57) n = n * 10 + a - 48
            }
            return {
              c: t - 1,
              r: n - 1
            }
          }(e)
        }) : null
      },
      parse_cmnt_xml: function(e, t) {
        if (!e) return [];
        var r = [];
        var a = e.match(/<comment [^>]*>/g);
        if (a) a.forEach(function(e) {
          var a = i(e);
          var o = t[a.ref];
          var c = e + '</comment>';
          var l = s(c);
          if (!o) o = t[a.ref] = {
            t: ''
          };
          var u = n(l);
          o.c = [{
            a: a.authorId,
            t: u
          }];
          o.c[0].r = l
        });
        return r
      },
      parse_ms_sip_xml: function(e) {
        var t = {};
        if (!e) return t;
        var n = e.match(/<[^>]*>/g);
        if (!n || n.length == 0) return t;
        var r = i(n[0]);
        if (!r.ContentTypeId) return t;
        n.forEach(function(e) {
          if (e.substr(1, 1) == '/') return;
          var n = i(e);
          if (!n.FieldName) return;
          var r = s(e);
          var a = vt(r);
          t[n.FieldName] = a.v
        });
        return t
      },
      write_ms_sip_xml: function(e) {
        var t = ie.utils.schema_id_map;
        var n = [];
        n[n.length] = xe.utils.XML_HEADER;
        n[n.length] = '<cts:CT_दारा_00100100790101001000_1029_00 xmlns:cts="http://www.w3.org/2001/XMLSchema-instance" ContentTypeId="0x0101002C938711466E3A44933E646452B32517" Version="0" xmlns="http://schemas.microsoft.com/office/2006/metadata/properties"><p:properties xmlns:p="http://schemas.microsoft.com/office/2006/metadata/properties/metaInternal"><p:ContentTypeId>0x0101002C938711466E3A44933E646452B32517</p:ContentTypeId></p:properties>';
        if (e && Object.keys(e).length > 0) {
          n[n.length] = '<d:दारा_00100100790101001000_1029_00 xmlns:d="http://schemas.microsoft.com/office/2006/metadata/properties/darra" xmlns:p="http://schemas.microsoft.com/office/2006/metadata/properties" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
          Object.keys(e).forEach(function(r) {
            var a = (e[r] || '').toString();
            if (t[r]) a = t[r](a);
            n[n.length] = '<d:' + r + ' xsi:type="xsd:string">' + _e(a) + '</d:' + r + '>'
          });
          n[n.length] = '</d:दारा_00100100790101001000_1029_00>'
        }
        n[n.length] = '</cts:CT_दारा_00100100790101001000_1029_00>';
        return n.join('')
      },
      parse_sty_xml: function(e, t) {
        var n = {};
        if (!e) return n;
        var r = e.match(/<[^>]*>/g);
        var a = false,
          i = false,
          o = false,
          c = false;
        if (r) r.forEach(function(e) {
          var t = l(e);
          if (t == '<cellXfs' || t == '<cellXfs>') a = true;
          if (t == '</cellXfs>') a = false;
          if (t == '<numFmts' || t == '<numFmts>') i = true;
          if (t == '</numFmts>') i = false;
          if (t == '<cellStyleXfs') c = true;
          if (t == '</cellStyleXfs>') c = false;
          if (a) {}
        });
        return n
      },
      parse_theme_xml: function(e, t) {
        var n = (t || {}).theme = {};
        if (!e) return n;
        var r = {};
        o(e).a.forEach(function(e) {
          var t = s(e);
          var a = l(e);
          var i = i(e);
          r[i.name] = s(e)
        });
        return n
      },
      parse_rels: function(e, t) {
        var n = {};
        if (!e) return n;
        if (e.match(/<[^>]*>/g)) e.match(/<[^>]*>/g).forEach(function(e) {
          var t = i(e);
          if (e.charAt(1) === 'R' && t.Id && t.Type) n[t.Id] = {
            Type: t.Type,
            Target: t.Target
          }
        });
        return n
      },
      parse_xlmeta_xml: function(e, t) {
        var n = {};
        if (!e) return n;
        var r = o(e);
        if (r.cell) n.LastAuthor = s(r.cell[0]);
        if (r.LastPrinted) n.LastPrinted = s(r.LastPrinted[0]);
        if (r.Author) n.Author = s(r.Author[0]);
        if (r.Created) n.CreatedDate = new Date(s(r.Created[0]));
        if (r.Modified) n.ModifiedDate = new Date(s(r.Modified[0]));
        return n
      },
      parse_core_props: function(e, t) {
        var n = {};
        if (!e) return n;
        var r = o(e);
        if (r['dc:creator']) n.Author = s(r['dc:creator'][0]);
        if (r['cp:lastModifiedBy']) n.LastAuthor = s(r['cp:lastModifiedBy'][0]);
        if (r['dcterms:created']) n.CreatedDate = new Date(s(r['dcterms:created'][0]));
        if (r['dcterms:modified']) n.ModifiedDate = new Date(s(r['dcterms:modified'][0]));
        if (r['dc:title']) n.Title = s(r['dc:title'][0]);
        if (r['dc:subject']) n.Subject = s(r['dc:subject'][0]);
        if (r['cp:keywords']) n.Keywords = s(r['cp:keywords'][0]);
        if (r['dc:description']) n.Description = s(r['dc:description'][0]);
        if (r['cp:category']) n.Category = s(r['cp:category'][0]);
        return n
      },
      parse_cust_props: function(e, t) {
        var r = {},
          a = {};
        if (!e) return [r, a];
        var c = false;
        s(e).split(',').forEach(function(e) {
          var t = i(e);
          switch (l(t)) {
            case '<Properties':
              c = true;
              break;
            case '</Properties>':
              c = false;
              break;
            case '<property':
              if (c) {
                var o = s(e);
                var l = vt(o);
                a[t.name] = l.v;
                var u = Ne[t.fmtid];
                if (!r[u]) r[u] = {};
                r[u][t.name] = a[t.name]
              }
          }
        });
        return [r, a]
      },
      parse_ext_props: function(e, t) {
        var n = {};
        if (!e) return n;
        var r = o(e);
        if (r.Application) n.Application = s(r.Application[0]);
        if (r.Company) n.Company = s(r.Company[0]);
        if (r.Manager) n.Manager = s(r.Manager[0]);
        if (r.DocSecurity) n.DocSecurity = s(r.DocSecurity[0]);
        return n
      },
      strip_ns: function(e) {
        return e.replace(/<(\/?)([a-zA-Z0-9]*:)/g, '<$1')
      },
      get_text_si: function(e, t) {
        var r = {};
        var a = false,
          i = false;
        if (!e) return [];
        var o = e.match(/<si.*<\/si>/g);
        if (o) o.forEach(function(e) {
          var o = i(e.substr(0, e.indexOf('>')));
          var c = n(s(e));
          r[o.i] = c;
          var l = e.match(/<rPh.*<\/rPh>/g);
          if (l) {
            var u = [];
            l.forEach(function(e) {
              var t = i(e.substr(0, e.indexOf('>')));
              var n = s(e);
              u[t.sb] = n
            });
            r[o.i] = u.join('')
          }
        });
        return r
      },
      parse_si: function(e, t) {
        var r = [];
        var a = false,
          i = false,
          o = 0;
        var c = e.match(/<si>.*<\/si>/g);
        if (c)
          for (var l = 0; l != c.length; ++l) {
            var u = c[l];
            var f = {
              T: n(s(u))
            };
            if (u.indexOf('<r>') !== -1) f.R = 1;
            if (u.indexOf('<t') !== -1) f.t = n(s(u));
            if (u.indexOf('<rPh') !== -1) f.p = 1;
            r[l] = f
          }
        return r
      },
      parse_sst_xml: function(e, t) {
        var r = [];
        if (!e) return r;
        var a = 0,
          i = 0;
        var o = e.match(/<si.*<\/si>/g);
        if (o)
          for (a = 0; a != o.length; ++a) {
            var c = o[a];
            var l = {
              T: n(s(c))
            };
            if (c.indexOf('<t') !== -1) l.t = n(s(c));
            if (c.indexOf('<r>') !== -1) {
              l.r = s(c)
            }
            r[a] = l
          }
        var u = i(e.match(/<sst[^>]*>/)[0]);
        r.Count = u.count;
        r.Unique = u.uniqueCount;
        return r
      },
      write_sst_xml: function(e, t) {
        var n = xe.utils.XML_HEADER + '<sst count="' + e.length + '" uniqueCount="' + e.length + '" xmlns="' + je.main[0] + '">';
        for (var r = 0; r < e.length; ++r) {
          n += '<si><t>' + _e(e[r].t) + '</t></si>'
        }
        n += '</sst>';
        return n
      }
    }
  })();
  e.utils = {
    cfb: t,
    utf8read: function(e) {
      var t = '',
        n = 0,
        r = 0,
        a = 0;
      while (n < e.length) {
        r = e.charCodeAt(n++);
        if (r < 128) t += String.fromCharCode(r);
        else if ((r > 191) && (r < 224)) {
          a = e.charCodeAt(n++);
          t += String.fromCharCode(((r & 31) << 6) | (a & 63))
        } else {
          a = e.charCodeAt(n++);
          var i = e.charCodeAt(n++);
          t += String.fromCharCode(((r & 15) << 12) | ((a & 63) << 6) | (i & 63))
        }
      }
      return t
    },
    consts: {
      XML_HEADER: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'
    },
    has_buf: typeof Buffer !== 'undefined',
    bconcat: function(e) {
      return Buffer.concat(e.map(function(e) {
        return Buffer.isBuffer(e) ? e : new Buffer(e)
      }))
    },
    rABS: typeof FileReader !== 'undefined' && typeof FileReader.prototype !== 'undefined' && typeof FileReader.prototype.readAsBinaryString !== 'undefined',
    wAB: typeof Uint8Array !== 'undefined',
    ReadShift: function(e, t) {
      var n;
      if (t === 'dbcs') {
        var r = this.l;
        n = this.slice(r, r + 2).toString('ucs2');
        this.l += 2;
        return n
      }
      switch (t) {
        case 'i1':
          n = this[this.l];
          this.l++;
          break;
        case 'i2':
          n = this.readUInt16LE(this.l);
          this.l += 2;
          break;
        case 'i4':
          n = this.readUInt32LE(this.l);
          this.l += 4;
          break;
        case 'i8':
          n = this.readUInt32LE(this.l + 4).toString(16) + this.readUInt32LE(this.l).toString(16);
          this.l += 8;
          break;
        case 'r4':
          n = this.readFloatLE(this.l);
          this.l += 4;
          break;
        case 'r8':
          n = this.readDoubleLE(this.l);
          this.l += 8;
          break;
        case 'f':
          this.l += 16;
          break;
        case 's':
          if (this.l >= this.length) return '';
          var a = this.readUInt16LE(this.l);
          this.l += 2;
          if (a === 0) return '';
          n = this.slice(this.l, this.l + a).toString('ascii');
          this.l += a;
          return n;
        case 'str':
          if (this.l >= this.length) return '';
          var i = this.readUInt32LE(this.l);
          this.l += 4;
          if (i === 0) return '';
          n = this.slice(this.l, this.l + i).toString('ascii');
          this.l += i;
          return n;
        case 'sz':
          if (this.l >= this.length) return '';
          var o, c = this.l;
          while ((o = this[c++]) !== 0 && c < this.length) {}
          n = this.slice(this.l, c - 1).toString('ascii');
          this.l = c;
          return n;
        case 'u':
          if (this.l >= this.length) return '';
          var l = this.readUInt32LE(this.l);
          this.l += 4;
          if (l === 0) return '';
          var s = this.slice(this.l, this.l + l).toString('ucs2');
          this.l += l;
          return s;
      }
      return n
    },
    ReadVarInt: function(e, t) {
      var n, r, a = 0,
        i = 0;
      do {
        n = e[t + i];
        i++;
        r = n & 127;
        a = a | (r << (i * 7 - 7))
      } while ((n & 128) >> 7);
      return [a, i]
    },
    ab2str: i,
    str2ab: o,
    djb2: l,
    crc32: f,
    adler32: function(e) {
      var t = 1,
        n = 0;
      for (var r = 0; r < e.length; ++r) {
        t = (t + e.charCodeAt(r)) % 65521;
        n = (n + t) % 65521
      }
      return (n << 16) | t
    },
    XML: d,
    keys: function(e) {
      var t = [];
      for (var n in e)
        if (Object.hasOwnProperty.call(e, n)) t.push(n);
      return t
    },
    warn: function() {},
    sheet_to_json: function(e, t) {
      var n = [],
        r = t && t.range ? t.range : '',
        a = 0,
        i = 0,
        o = 0,
        c = 0,
        l = 0,
        s = 0;
      if (e['!ref']) {
        var u = e['!ref'].split(':');
        a = e[u[0]].r;
        i = e[u[0]].c;
        c = e[u[1]].r;
        l = e[u[1]].c
      }
      var f = t && t.header === 1 ? e[t.header - 1] : t && t.header === 'A' ? (function(e) {
        var t = [];
        for (var n = 0; e[n]; ++n) t[n] = String.fromCharCode(65 + n);
        return t
      })(l) : t && Array.isArray(t.header) ? t.header : null;
      var d = [];
      for (o = a; o <= c; ++o) {
        var h = f ? {} : [];
        for (s = i; s <= l; ++s) {
          var v = e[String.fromCharCode(65 + s) + (o + 1)];
          if (v) {
            var m = v.w || v.v;
            if (f) h[f[s]] = m;
            else h[s] = m
          }
        }
        d.push(h)
      }
      return d
    }
  }
  var h = function() {
    var n = function() {
      var e = 4096;
      var t = new Array(e);
      for (var n = 0; n < e; ++n) {
        t[n] = 0
      }
      return t
    }();
    var r = function() {
      var e = 286;
      var t = new Array(e);
      for (var n = 0; n < e; ++n) {
        t[n] = 0
      }
      return t
    }();
    var a = function() {
      var e = 30;
      var t = new Array(e);
      for (var n = 0; n < e; ++n) {
        t[n] = 0
      }
      return t
    }();
    var i = function() {
      var e = 19;
      var t = new Array(e);
      for (var n = 0; n < e; ++n) {
        t[n] = 0
      }
      return t
    }();
    var o = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var c = function(e, t) {
      var n = 0;
      while (n < t) {
        e[n] = 0;
        n++
      }
    };
    var l = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
    var s = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    var u = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
    var f = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    var d = function(e, t, n, r) {
      this.data = e;
      this.p = 0;
      this.q = 0;
      this.j = new Array(r);
      c(this.j, r);
      this.m = new Array(1 << t);
      c(this.m, 1 << t);
      this.l = new Array(1 << n);
      c(this.l, 1 << n);
      this.d = (1 << t) - 1;
      this.e = (1 << n) - 1;
      this.k = t;
      this.o = n
    };
    var h = function(e, t, n) {
      var r = 0,
        a = 0,
        i, o;
      var c = new Array(t + 1);
      for (o = 0; o <= t; o++) c[o] = 0;
      for (o = 0; o < n; o++) c[e[o]]++;
      for (o = 1; o <= t; o++) r = (r + c[o - 1]) << 1;
      i = new Array(t + 1);
      for (a = 0; a <= t; a++) i[a] = 0;
      for (o = 0; o < n; o++)
        if (e[o] != 0) i[o] = r++;
      return i
    };
    var v = function(e, t, n) {
      var r = 0,
        a = 0,
        i = 0;
      var o = 1 << n;
      var c = new Array(o);
      var l = new Array(o);
      c.p = 0;
      for (i = 0; i < e.length; ++i) {
        var s = e[i];
        if (s > n) {
          c.p = -1;
          break
        }
        var u = t[i];
        var f = u;
        var d = n - s;
        for (r = 0; r < 1 << d; ++r) {
          f = u | (r << s);
          for (a = (f >> 1); a > 0; a = (a >> 1)) {
            if (l[a]) {
              c.p = -1;
              break
            }
          }
          if (c.p == -1) break;
          l[f] = 1;
          c[f] = (s << 16) | i
        }
        if (c.p == -1) break
      }
      return c
    };
    var m = function(e) {
      this.b = e;
      this.c = 0;
      this.a = 0;
      this.f = 0
    };
    m.prototype.g = function(e) {
      while (this.c < e) {
        this.f |= this.b[this.a++] << this.c;
        this.c += 8
      }
    };
    m.prototype.h = function(e) {
      return (this.f & ((1 << e) - 1))
    };
    m.prototype.i = function(e) {
      this.f >>= e;
      this.c -= e
    };
    var p = function(e, t) {
      var n = 0,
        r = 0,
        a = 0;
      a = e.h(t);
      n = 0;
      while (n < r.length) {
        if (a < r[n + 1] << t - r[n]) {
          break
        }
        n += 2
      }
      return e.i(r[n]), r[n + 1]
    };
    var g = function(e, t, i) {
      var o = 0,
        c, s, d;
      var p, g;
      var w;
      if (t == 2) {
        var k = new m(e);
        k.g(3);
        var y = k.h(1);
        k.i(1);
        var b = k.h(2);
        k.i(2);
        var A = [];
        var x = [];
        var C = [];
        var S = 0,
          E = 0,
          T = 0;
        var _ = null,
          j = null;
        if (b == 0) {
          var M = 0;
          k.g(16);
          M = k.h(16);
          k.i(16);
          k.g(16);
          var N = k.h(16);
          k.i(16);
          var O = new Array(M);
          var P = 0;
          while (P < M) {
            O[P] = k.h(8);
            k.i(8);
            P++
          }
          var F = 0;
          while (F < M) i[F] = O[F];
          return M
        } else if (b == 1) {
          S = k.h(5) + 257;
          k.i(5);
          E = k.h(5) + 1;
          k.i(5);
          T = k.h(4) + 4;
          k.i(4);
          for (c = 0; c < T; c++) {
            A[o[c]] = k.h(3);
            k.i(3)
          }
          for (c = T; c < 19; c++) A[o[c]] = 0;
          p = h(A, 7, 19);
          _ = v(A, p, 7);
          var D = S + E;
          var R = 0;
          var I = new Array(D);
          while (R < D) {
            k.g(7);
            d = k.h(7);
            s = _[d];
            k.i(s >> 16);
            if ((s & 65535) < 16) {
              I[R++] = s & 65535
            } else {
              var U = 0,
                L = 0;
              if ((s & 65535) == 16) {
                k.g(2);
                U = k.h(2) + 3;
                k.i(2);
                L = I[R - 1]
              } else if ((s & 65535) == 17) {
                k.g(3);
                U = k.h(3) + 3;
                k.i(3);
                L = 0
              } else if ((s & 65535) == 18) {
                k.g(7);
                U = k.h(7) + 11;
                k.i(7);
                L = 0
              }
              while (U-- > 0) I[R++] = L
            }
          }
          var B = I.slice(0, S);
          var V = I.slice(S, S + E);
          var z = h(B, 15, S);
          var H = h(V, 15, E);
          _ = v(B, z, 15);
          j = v(V, H, 15)
        } else if (b == 2) {
          S = k.h(5) + 257;
          k.i(5);
          E = k.h(5) + 1;
          k.i(5);
          T = k.h(4) + 4;
          k.i(4);
          for (c = 0; c < T; c++) {
            A[o[c]] = k.h(3);
            k.i(3)
          }
          for (c = T; c < 19; c++) A[o[c]] = 0;
          p = h(A, 7, 19);
          _ = v(A, p, 7);
          var W = S + E;
          var X = 0;
          var q = new Array(W);
          while (X < W) {
            k.g(7);
            d = k.h(7);
            s = _[d];
            k.i(s >> 16);
            if ((s & 65535) < 16) {
              q[X++] = s & 65535
            } else {
              var Y = 0,
                G = 0;
              if ((s & 65535) == 16) {
                k.g(2);
                Y = k.h(2) + 3;
                k.i(2);
                G = q[X - 1]
              } else if ((s & 65535) == 17) {
                k.g(3);
                Y = k.h(3) + 3;
                k.i(3);
                G = 0
              } else if ((s & 65535) == 18) {
                k.g(7);
                Y = k.h(7) + 11;
                k.i(7);
                G = 0
              }
              while (Y-- > 0) q[X++] = G
            }
          }
          var J = q.slice(0, S);
          var K = q.slice(S, S + E);
          var Q = h(J, 15, S);
          var Z = h(K, 15, E);
          _ = v(J, Q, 15);
          j = v(K, Z, 15)
        } else {
          return -1
        }
        o = 0;
        var $ = 0;
        while (o < i.length) {
          k.g(15);
          d = k.h(15);
          s = _[d];
          k.i(s >> 16);
          c = s & 65535;
          if (c < 256) {
            i[o++] = c
          } else if (c == 256) {
            break
          } else {
            c -= 257;
            var ee = l[c];
            k.g(s[c]);
            var te = k.h(s[c]);
            k.i(s[c]);
            k.g(15);
            d = k.h(15);
            s = j[d];
            k.i(s >> 16);
            var ne = s & 65535;
            var re = u[ne];
            k.g(f[ne]);
            var ae = k.h(f[ne]);
            k.i(f[ne]);
            var ie = o - (re + ae);
            for ($ = 0; $ < ee + te; $++) i[o] = i[ie + $], o++
          }
        }
        return o
      }
    };
    return {
      I: g
    }
  }();
  e.utils.zlib = h;
  e.read = function(t, n) {
    var r = n || {};
    r.WTF = true;
    var a = function(e, t) {
      var n = t || {};
      var r = e;
      var a = n.type;
      if (!a) {
        if (typeof Buffer !== 'undefined' && e instanceof Buffer) a = 'buffer';
        else if (e instanceof ArrayBuffer) a = 'array';
        else a = 'binary'
      }
      switch (a) {
        case 'base64':
          var i = atob(e);
          var o = new Uint8Array(i.length);
          for (var c = 0; c < i.length; ++c) o[c] = i.charCodeAt(c);
          return o;
        case 'binary':
          var o = new Uint8Array(e.length);
          for (var c = 0; c < e.length; ++c) o[c] = e.charCodeAt(c) & 0xFF;
          return o;
        case 'buffer':
          return new Uint8Array(e);
        case 'array':
          return new Uint8Array(e)
      }
    }(t, r);
    return function(t, n) {
      var r = n || {};
      var a = function(t, n) {
        var r = t;
        var a = [];
        var i = 0,
          o = 0,
          c = 0;
        var l = e.utils.ReadShift,
          s = e.utils.ReadVarInt;
        var u = function(e) {
          var t = {},
            n = '',
            r, a;
          var i = e.l,
            o = 0,
            c = 0;
          while (e.l < e.length) {
            o = l(e, 'i2');
            c = l(e, 'i2');
            a = '';
            for (r = 0; r < c; ++r) a += String.fromCharCode(l(e, 'i1'));
            t[o] = a
          }
          return t
        };
        var f = function(t) {
          var n = {},
            r, a = {};
          var i = t.l;
          while (t.l < t.length) {
            r = l(t, 'i4');
            switch (r) {
              case 33620224:
                return n;
              case 67324752:
                n.l = t.l;
                n.v = l(t, 'i2');
                n.gp = l(t, 'i2');
                n.cm = l(t, 'i2');
                n.mt = l(t, 'i2');
                n.md = l(t, 'i2');
                n.crc = l(t, 'i4');
                n.cs = l(t, 'i4');
                n.us = l(t, 'i4');
                n.fnl = l(t, 'i2');
                n.xtl = l(t, 'i2');
                if (n.fnl > t.length - t.l) {
                  e.utils.warn('bad filename length: ' + n.fnl);
                  n.fnl = 0
                }
                n.name = '';
                for (var o = 0; o < n.fnl; ++o) n.name += String.fromCharCode(l(t, 'i1'));
                if (n.xtl) a = u(t.slice(t.l, t.l + n.xtl));
                n.data = t.slice(t.l, t.l + n.cs);
                t.l += n.cs;
                return n;
              case 134695760:
                n.s = 'dd';
                n.crc = l(t, 'i4');
                n.cs = l(t, 'i4');
                n.us = l(t, 'i4');
                return n;
              default:
                e.utils.warn('unknown zip header: ' + r);
                t.l = t.length;
                return n
            }
          }
          return n
        };
        var d = function(t) {
          var n = [],
            r;
          while (t.l < t.length) {
            r = f(t);
            if (!r.name) break;
            n.push(r)
          }
          return n
        };
        var h = function(t, n) {
          var r, a = [],
            i = {};
          var o = e.utils.ReadShift;
          var c = n || {};
          var l = function(e) {
            var t = {},
              n = '',
              r;
            t.l = e.l;
            t.v = o(e, 'i2');
            t.gp = o(e, 'i2');
            t.cm = o(e, 'i2');
            t.mt = o(e, 'i2');
            t.md = o(e, 'i2');
            t.crc = o(e, 'i4');
            t.cs = o(e, 'i4');
            t.us = o(e, 'i4');
            var a = o(e, 'i2');
            var i = o(e, 'i2');
            var c = o(e, 'i2');
            t.fnl = a;
            t.name = '';
            for (r = 0; r < a; ++r) t.name += String.fromCharCode(o(e, 'i1'));
            if (i > 0) t.xtra = e.slice(e.l, e.l + i);
            e.l += i;
            if (c > 0) t.cmnt = e.slice(e.l, e.l + c);
            e.l += c;
            return t
          };
          var s = function(e) {
            var t = {};
            t.l = e.l;
            var n = o(e, 'i2');
            var r = o(e, 'i2');
            var a = o(e, 'i4');
            var i = o(e, 'i4');
            var c = o(e, 'i4');
            var s = o(e, 'i2');
            return t
          };
          var u = function(e) {
            var t = {};
            t.l = e.l;
            var n = o(e, 'i4');
            var r = o(e, 'i4');
            var a = o(e, 'i4');
            var i = o(e, 'i4');
            var c = o(e, 'i4');
            var s = o(e, 'i4');
            var u = o(e, 'i2');
            return t
          };
          var f = function(e) {
            var t = {};
            t.l = e.l;
            var n = o(e, 'i4');
            if (n != 101010256) throw new Error('invalid zip end of central directory signature');
            var r = o(e, 'i2');
            var a = o(e, 'i2');
            var i = o(e, 'i2');
            var c = o(e, 'i2');
            var l = o(e, 'i4');
            var s = o(e, 'i4');
            var u = o(e, 'i2');
            if (u > 0) t.cmnt = e.slice(e.l, e.l + u);
            return t
          };
          var d = t.length - 22;
          while (d >= 0 && t.readUInt32LE(d) !== 101010256) d--;
          if (d < 0) throw new Error('not a zip file');
          t.l = d;
          var h = f(t);
          t.l = h.l - h.s;
          var v = t.slice(t.l, h.l);
          for (var m = 0; m < h.i; ++m) {
            o(v, 'i4');
            a.push(l(v))
          }
          return a
        };
        var v = function(t, n) {
          var r = n && n.type;
          if (!r) {
            if (typeof Buffer !== 'undefined' && t instanceof Buffer) r = 'buffer';
            else if (t instanceof ArrayBuffer) r = 'array';
            else r = 'binary'
          }
          switch (r) {
            case 'base64':
              var a = atob(t);
              var i = new e.utils.ReadShift(a.length);
              for (var o = 0; o < a.length; ++o) i[o] = a.charCodeAt(o);
              return i;
            case 'binary':
              var i = new e.utils.ReadShift(t.length);
              for (var o = 0; o < t.length; ++o) i[o] = t.charCodeAt(o) & 255;
              return i;
            case 'buffer':
              return t;
            case 'array':
              return new Buffer(t)
          }
        }(t, n);
        if (v.length < 4) throw new Error('not enough data');
        switch (v.readUInt32LE(0)) {
          case 2055415808:
            return d(v);
          case 101010256:
            return h(v);
          case 67324752:
            return d(v);
          default:
            throw new Error('invalid zip file')
        }
      }(t);
      var i = r.password;
      var o = {};
      var c = [];
      var l = {};
      for (var s = 0; s < a.length; ++s) {
        var u = a[s];
        var f = u.name;
        if (f.slice(-1) == '/') c.push(f);
        else l[f] = u
      }
      var d = function(t) {
        if (!t) return;
        var n = e.utils.zlib.I(t.data, t.cm, t.us);
        l[t.name].data = n
      };
      for (s = 0; s < a.length; ++s) {
        if (a[s].name.slice(-1) != '/') d(a[s])
      }
      o.files = l;
      o.dirs = c;
      return o
    }(t)
  }
  e.write = function(t, n) {
    var r = n || {};
    var a = function(t, n) {
      var r = n || {},
        a, i;
      var o = [];
      var c = [],
        l = [],
        s = [],
        u = [];
      var f = 0,
        d = 0,
        h = 0;
      var v = function(e) {
        var t = 0,
          n = 0,
          r = 0,
          a, i;
        var o = e.length;
        var c = [];
        var l = 0,
          s = 0,
          u = 0,
          f = 0;
        var d = function(e, t) {
          var n = new Array(t);
          for (var r = 0; r < t; ++r) n[r] = e.charCodeAt(r);
          return n
        };
        var h = function(e, t) {
          var n = new Array(t);
          for (var r = 0; r < t; ++r) n[r] = e[r];
          return n
        };
        for (r = 0; r < o; r += 4096) {
          l = Math.min(4096, o - r);
          var v = r + l == o;
          var m = d(e.slice(r, r + l), l);
          c = c.concat(function(e, t, n) {
            var r = [],
              a, i;
            var o = e.length;
            var c = 0,
              l = 0;
            var s = 0;
            r.push(t ? 1 : 0);
            var u = ~o,
              f = ~l;
            r.push(o & 255, (o >> 8) & 255);
            r.push(u & 255, (u >> 8) & 255);
            for (var d = 0; d < e.length; ++d) r.push(e[d]);
            return r
          }(m, v))
        }
        return c
      };
      var m = function() {
        var e = new Array(12);
        for (var t = 0; t < 12; ++t) e[t] = 0;
        return e
      };
      var p = function(e) {
        var t = new Date(e);
        var n = t.getFullYear(),
          r = t.getMonth() + 1,
          a = t.getDate();
        var i = t.getHours(),
          o = t.getMinutes(),
          c = t.getSeconds();
        return (((n - 1980) & 127) << 25) | (r << 21) | (a << 16) | (i << 11) | (o << 5) | (c >> 1)
      };
      var g = function(t) {
        var n = new Array(30);
        var r = t.length;
        n[0] = 80;
        n[1] = 75;
        n[2] = 3;
        n[3] = 4;
        n[4] = 20;
        n[5] = 0;
        n[6] = 0;
        n[7] = 0;
        n[8] = 8;
        n[9] = 0;
        var a = p(new Date);
        n[10] = a & 255;
        n[11] = (a >> 8) & 255;
        n[12] = (a >> 16) & 255;
        n[13] = (a >> 24) & 255;
        var i = e.utils.crc32(t);
        var o = v(t);
        var c = o.length;
        n[14] = i & 255;
        n[15] = (i >> 8) & 255;
        n[16] = (i >> 16) & 255;
        n[17] = (i >> 24) & 255;
        n[18] = c & 255;
        n[19] = (c >> 8) & 255;
        n[20] = (c >> 16) & 255;
        n[21] = (c >> 24) & 255;
        n[22] = r & 255;
        n[23] = (r >> 8) & 255;
        n[24] = (r >> 16) & 255;
        n[25] = (r >> 24) & 255;
        return n
      };
      var w = function(e) {
        var t = e.length;
        var n = new Array(t);
        for (var r = 0; r < t; ++r) n[r] = e.charCodeAt(r);
        return n
      };
      var k = function(e, t, n) {
        var r = new Array(t.length + n.length + 30);
        for (var a = 0; a < e.length; ++a) r[a] = e[a];
        for (a = 0; a < t.length; ++a) r[e.length + a] = t[a];
        for (a = 0; a < n.length; ++a) r[e.length + t.length + a] = n[a];
        return r
      };
      var y = function(t, n) {
        var r = w(n);
        var a = r.length;
        var i = new Array(46 + a);
        i[0] = 80;
        i[1] = 75;
        i[2] = 1;
        i[3] = 2;
        i[4] = 20;
        i[5] = 0;
        i[6] = 20;
        i[7] = 0;
        i[8] = 0;
        i[9] = 0;
        i[10] = 8;
        i[11] = 0;
        var o = p(new Date);
        i[12] = o & 255;
        i[13] = (o >> 8) & 255;
        i[14] = o & 255;
        i[15] = (o >> 8) & 255;
        i[16] = (o >> 16) & 255;
        i[17] = (o >> 24) & 255;
        var c = e.utils.crc32(t);
        var l = v(t);
        var s = l.length;
        var u = t.length;
        i[18] = c & 255;
        i[19] = (c >> 8) & 255;
        i[20] = (c >> 16) & 255;
        i[21] = (c >> 24) & 255;
        i[22] = s & 255;
        i[23] = (s >> 8) & 255;
        i[24] = (s >> 16) & 255;
        i[25] = (s >> 24) & 255;
        i[26] = u & 255;
        i[27] = (u >> 8) & 255;
        i[28] = (u >> 16) & 255;
        i[29] = (u >> 24) & 255;
        i[30] = a & 255;
        i[31] = (a >> 8) & 255;
        i[32] = 0;
        i[33] = 0;
        i[34] = 0;
        i[35] = 0;
        i[36] = 0;
        i[37] = 0;
        i[38] = 0;
        i[39] = 0;
        i[40] = 0;
        i[41] = 0;
        i[42] = f & 255;
        i[43] = (f >> 8) & 255;
        i[44] = (f >> 16) & 255;
        i[45] = (f >> 24) & 255;
        for (var d = 0; d < a; ++d) i[46 + d] = r[d];
        return i
      };
      var b = function(e, t) {
        var n = new Array(22);
        n[0] = 80;
        n[1] = 75;
        n[2] = 5;
        n[3] = 6;
        n[4] = 0;
        n[5] = 0;
        n[6] = 0;
        n[7] = 0;
        n[8] = e & 255;
        n[9] = (e >> 8) & 255;
        n[10] = e & 255;
        n[11] = (e >> 8) & 255;
        n[12] = t & 255;
        n[13] = (t >> 8) & 255;
        n[14] = (t >> 16) & 255;
        n[15] = (t >> 24) & 255;
        n[16] = h & 255;
        n[17] = (h >> 8) & 255;
        n[18] = (h >> 16) & 255;
        n[19] = (h >> 24) & 255;
        n[20] = 0;
        n[21] = 0;
        return n
      };
      var A = Object.keys(t.files);
      for (var x = 0; x < A.length; ++x) {
        var C = A[x];
        var S = t.files[C];
        var E = g(S.data);
        var T = w(C);
        var _ = v(S.data);
        var j = k(E, T, _);
        c.push(j);
        var M = y(S.data, C);
        l.push(M);
        f += j.length;
        h += M.length
      }
      var N = b(A.length, h);
      var O = c.concat(l, [N]);
      var P = 0;
      for (x = 0; x < O.length; ++x) P += O[x].length;
      var F = new Array(P);
      P = 0;
      for (x = 0; x < O.length; ++x) {
        for (var D = 0; D < O[x].length; ++D) F[P++] = O[x][D]
      }
      if (r.type == 'binary') return String.fromCharCode.apply(null, F);
      if (r.type == 'base64') return btoa(String.fromCharCode.apply(null, F));
      if (r.type == 'array') return F;
      return F
    }(t, r)
  }
})(XLSX);
