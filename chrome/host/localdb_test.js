describe('LocalDB', function() {
  var localDb;

  beforeEach(function() {
    localStorage.clear(); // Cleanup all the previous state.
    localDb = new LocalDb();
  });

  it('should save/lookup a word', function() {
    var original = new Word('test', Lang.ENGLISH, WordStatus.KNOWN, 3, 2);
    var result = localDb.save(original);
    expect(result.statusUpdated).toBe(true);
    expect(result.numContextsAdded).toBe(0);
    var key = new WordKey('test', Lang.ENGLISH);
    var fetched = localDb.lookup(key);
    expect(fetched.word).toEqual(original.word);
    expect(fetched.lang).toEqual(original.lang);
    expect(fetched.status).toEqual(original.status);
    expect(fetched.numTimesSeen).toEqual(original.numTimesSeen);
    expect(fetched.numTimesUsed).toEqual(original.numTimesUsed);
    expect(localDb.lookup(new WordKey('test', Lang.UKRAINIAN))).toBe(null);
  });

  it('should save contexts', function() {
    var original = new Word('test', Lang.ENGLISH, WordStatus.KNOWN, 3, 2);
    var result = localDb.save(original, [new WordContext(' let it test', null, 'http://test.it')]);
    expect(result.statusUpdated).toBe(true);
    expect(result.numContextsAdded).toBe(1);
    // TODO: Update to fetch them once implemented.
  });
});