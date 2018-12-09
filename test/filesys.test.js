//
// Tests for file system functionality.
//
'use strict';

const filesys = require('../filesys');

///////////////////

test('extractExtension for file names', () => {
  expect(filesys.extractExtension('myfile.test')).toBe('test');
  expect(filesys.extractExtension('myfile.exe')).toBe('exe');
  expect(filesys.extractExtension('myfile.a')).toBe('a');
});

test('extractExtension for file paths', () => {
  expect(filesys.extractExtension('/a/b/myfile.test')).toBe('test');
  expect(filesys.extractExtension('/myfile.exe')).toBe('exe');
  expect(filesys.extractExtension('C:\\a\\myfile.a')).toBe('a');
});

test('extractExtension for no extension', () => {
  expect(filesys.extractExtension('/a/b/myfile')).toBe('');
  expect(filesys.extractExtension('/myfile.')).toBe('');
  expect(filesys.extractExtension('.')).toBe('');
  expect(filesys.extractExtension('')).toBe('');
});

test('extractExtension for extension only', () => {
  expect(filesys.extractExtension('.txt')).toBe('txt');
});

test('extractExtension for multiple dots in path', () => {
  expect(filesys.extractExtension('a.b.txt')).toBe('txt');
  expect(filesys.extractExtension('a.b.')).toBe('');
  expect(filesys.extractExtension('a.b.c')).toBe('c');
  expect(filesys.extractExtension('a...c')).toBe('c');
});

test('extractExtension for character cases', () => {
  expect(filesys.extractExtension('lower.txt')).toBe('txt');
  expect(filesys.extractExtension('upper.TXT')).toBe('TXT');
  expect(filesys.extractExtension('mixed.Txt')).toBe('Txt');
});

///////////////////

test('extractFileName for file names', () => {
  expect(filesys.extractFileName('myfile.test')).toBe('myfile.test');
  expect(filesys.extractFileName('f.exe')).toBe('f.exe');
  expect(filesys.extractFileName('file.a')).toBe('file.a');
  expect(filesys.extractFileName('File')).toBe('File');
});

test('extractFileName for file paths', () => {
  expect(filesys.extractFileName('/a/b/myfile.test')).toBe('myfile.test');
  expect(filesys.extractFileName('/myfile.exe')).toBe('myfile.exe');
  expect(filesys.extractFileName('aa/file')).toBe('file');
  expect(filesys.extractFileName('C:\\a\\myfile.a')).toBe('myfile.a');
});

test('extractFileName for no file name', () => {
  expect(filesys.extractExtension('/a/b/')).toBe('');
  expect(filesys.extractExtension('/')).toBe('');
  expect(filesys.extractExtension('C:\\dir\\sub\\')).toBe('');
  expect(filesys.extractExtension('')).toBe('');
});
