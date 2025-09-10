### Состояние fast-forward

Две ветки находятся в состоянии fast-forward, если одну из них можно «перемотать» вперёд и она будет содержать те же коммиты, что и другая. Это утверждение можно сформулировать иначе:

- при слиянии этих двух веток никак не возможен конфликт;
- истории этих двух веток не «разошлись»;
- одна ветка является продолжением другой.

Хотя все эти условия звучат по-разному, они значат одно и то же.

Разберём на примере. Есть две ветки: `main` и `add-docs` (англ. «добавить документацию»). В ветке `main` четыре коммита, от неё создали ветку `add-docs` и добавили в неё ещё два коммита.

```bash
$ git branch
* add-docs
  main

$ git log --oneline
e08fa2a (HEAD -> add-docs) New docs 2
fd588b2 New docs 1
997d9ce (main) Commit 4
0313e8e Commit 3
5848aba Commit 2
04923d7 Commit 1 
```

Схематически можно изобразить ветки `main` и `add-docs` так.

![](https://pictures.s3.yandex.net/resources/M4_T2_01_1689342594.png)

Ветка `add-docs` «обгоняет» ветку `main` на два коммита: N1N1​ и N2N2​ (в нашем примере с кодом они называются `New docs 1` и `New docs 2`).

Допустим, мы хотим влить ветку `add-docs` в `main`. При этом все коммиты из `add-docs` можно просто «положить» в `main`, и они выстроятся за уже существующими.

Результат слияния будет выглядеть так.

```bash
$ git checkout main
$ git merge add-docs
Updating 997d9ce..e08fa2a
Fast-forward
 docs.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 docs.txt

$ git log --oneline
e08fa2a (HEAD -> main, add-docs) New docs 2
fd588b2 New docs 1
997d9ce Commit 4
0313e8e Commit 3
5848aba Commit 2
04923d7 Commit 1 
```

Обратите внимание на два момента:

- При слиянии веток Git выводит строку `Fast-forward`.
- В истории коммитов `HEAD` указывает одновременно и на `main`, и на `add-docs`. После такого слияния эти ветки одинаковые: в них одни и те же коммиты.

Схематически результат слияния веток выглядит так.

![](https://pictures.s3.yandex.net/resources/M4_T2_02_1689342662.png)

Git просто добавил коммиты из `add-docs` в ветку `main`, или **перемотал** `main` вперёд до состояния `add-docs`. Отсюда и название «перемотка».

### **Можно ли отключить fast-forward**

Fast-forward слияние веток можно отключить флагом `--no-ff`. Например: `git merge --no-ff add-docs`. Также его можно отключить «навсегда» (до тех пор, пока вы не вернёте настройку «как было») с помощью настройки [`merge.ff`](https://git-scm.com/docs/git-merge#Documentation/git-merge.txt-mergeff): `git config [--global] merge.ff false`.

Если отключить слияние в режиме fast-forward, вместо «перемотки» ветки Git создаст в ней **коммит слияния** (англ. _merge commit_) — в обиходе его называют **merge-коммит** или **мёрж-коммит**. В этом случае результат «вливания» ветки `add-docs` в `main` выглядел бы так.

```bash
# находимся в ветке main
# --no-edit отключает ввод сообщения для merge-коммита
# --no-ff отключает fast-forward слияние веток
$ git merge --no-edit --no-ff add-docs
Merge made by the 'ort' strategy.
 docs.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 docs.txt

# с флагом --graph
# Git нарисует ветки с помощью «палочек» и «звёздочек»
# получившийся коммит слияния: 6814789
$ git log --graph --oneline
*   6814789 (HEAD -> main) Merge branch 'add-docs'
|\
| * e08fa2a (add-docs) New docs 2
| * fd588b2 New docs 1
|/
* 997d9ce Commit 4
* 0313e8e Commit 3
* 5848aba Commit 2
* 04923d7 Commit 1 
```

На схеме результат слияния будет таким.

![](https://pictures.s3.yandex.net/resources/M4_T2_03_1689342784.png)

💡 **Зачем отключать fast-forward?**

Многие проекты отключают fast-forward слияние веток, потому что при нём теряется часть информации. Результат выглядит так, как будто в `main` «просто появились» новые коммиты. Если не знать о ветке `add-docs`, то можно подумать, что такой ветки и не было.

Полноценный коммит слияния сохраняет всю информацию: в нём будет указано, какая именно ветка вливалась в `main`.

![[Pasted image 20240916074434.png]]

- Если истории двух веток не «разошлись» и их коммиты выстраиваются в одну цепочку, эти ветки можно объединить в режиме fast-forward.
- Режим fast-forward можно отключить с помощью флага `--no-ff`.