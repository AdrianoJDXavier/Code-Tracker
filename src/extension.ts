// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, ProgressLocation, TextEditor, DecorationOptions, Range, Position, ExtensionContext, commands, workspace} from 'vscode';
import * as vscode from 'vscode';

const decorationType = window.createTextEditorDecorationType({
	backgroundColor: 'rgba(255, 0, 0, 0.7)',
	border: '1px solid #FF0000',
	borderRadius: '4px',
	fontStyle: 'italic',
	fontWeight: 'bold',
	textDecoration: 'underline'
});

const generalCommentDecorationType = window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 255, 0, 0.2)', 
    border: '1px solid #00FF00',
    fontStyle: 'italic'
});

const longCommentDecorationType = window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 255, 0, 0.2)', 
    border: '1px solid #00FF00',
    fontStyle: 'italic'
});

const encoddingDecorationType = window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.7)',
	border: '1px solid #FFFF00',
	borderRadius: '4px',
	fontStyle: 'italic',
	fontWeight: 'bold',
    color : '#000000',
	textDecoration: 'underline'
});


const terms = ["echo","rp_erro","rp_pre","rp_echo","rp_mail","email","mysql_affected_rows","mysql_client_encoding","mysql_close","mysql_connect","mysql_create_db","mysql_data_seek","mysql_db_name","mysql_db_query","mysql_drop_db","mysql_errno","mysql_error","mysql_escape_string","mysql_fetch_array","mysql_fetch_assoc","mysql_fetch_field","mysql_fetch_lengths","mysql_fetch_object","mysql_fetch_row","mysql_field_flags","mysql_field_len","mysql_field_name","mysql_field_seek","mysql_field_table","mysql_field_type","mysql_free_result","mysql_get_client_info","mysql_get_host_info","mysql_get_proto_info","mysql_get_server_info","mysql_info","mysql_insert_id","mysql_list_dbs","mysql_list_fields","mysql_list_processes","mysql_list_tables","mysql_num_fields","mysql_num_rows","mysql_pconnect","mysql_ping","mysql_query","mysql_real_escape_string","mysql_result","mysql_select_db","mysql_set_charset","mysql_stat","mysql_tablename","mysql_thread_id","mysql_unbuffered_query","error","exit","print_r","var_dump","ini_set","console\.assert","console\.count","console\.debug","console\.dir","console\.error","console\.exception","console\.groupCollapsed","console\.groupEnd","console\.group","console\.info","console\.log","console\.profileEnd","console\.profile","console\.timeEnd","console\.time","console\.table","console\.trace","console\.warn","rp_last_id","session\.inc\.php","ckeditor","neymar","bresq","quente","include_once","require_once","chutancia","balde","formzera","maneiro","ney","gridzada","link","login","senha", 'docDelete', 'docPath', 'rp_pdo_select_table', 'rp_pdo_update_table', 'rp_pdo_insert_table', 'rp_pdo_delete_table', 'delete', 'DELETE'];

const termsEncodingErrors = ["�","ï¿½","ÿ","�","�","�","Ä","Â","Ã©","Ã¨","Ã¯","Ã¶","Ã¼","Ã±","Ã§","Ã£","Ã³","Ã¡","Ã§Ã£","Ã©",""];

const termsDepreciated = {
    "strftime('%D');": "IntlDateFormatter('en_US', IntlDateFormatter::LONG, IntlDateFormatter::NONE).format(time());",
    "gmstrftime('%D');": "IntlDateFormatter('en_US', IntlDateFormatter::LONG, IntlDateFormatter::NONE).format(time());",
    "utf8_encode": "mb_convert_encoding($string, 'UTF-8', 'ISO-8859-1');",
    "utf8_decode": "mb_convert_encoding($string, 'ISO-8859-1', 'UTF-8');",
    "enchant_broker_set_dict_path(, enchant_broker_get_dict_path()": "unset the object instead",
    "enchant_dict_add_to_personal(": "enchant_dict_add()",
    "enchant_dict_is_in_session(": "enchant_dict_is_added()",
    "libxml_disable_entity_loader(;": "libxml_set_external_entity_loader()",
    "pg_errormessage(": "pg_last_error()",
    "pg_numrows(": "pg_num_rows()",
    "pg_numfields(": "pg_num_fields()",
    "pg_cmdtuples(": "pg_affected_rows()",
    "pg_fieldname(": "pg_field_name()",
    "pg_fieldsize(": "pg_field_size()",
    "pg_fieldtype(": "pg_field_type()",
    "pg_fieldnum(": "pg_field_num()",
    "pg_result(": "pg_fetch_result()",
    "pg_fieldprtlen(": "pg_field_prtlen()",
    "pg_fieldisnull(": "pg_field_is_null()",
    "pg_freeresult(": "pg_free_result()",
    "pg_getlastoid(": "pg_last_oid()",
    "pg_locreate(": "pg_lo_create()",
    "pg_lounlink(": "pg_lo_unlink()",
    "pg_loopen(": "pg_lo_open()",
    "pg_loclose(": "pg_lo_close()",
    "pg_loread(": "pg_lo_read()",
    "pg_lowrite(": "pg_lo_write()",
    "pg_loreadall(": "pg_lo_read_all()",
    "pg_loimport(": "pg_lo_import()",
    "pg_loexport(": "pg_lo_export()",
    "pg_setclientencoding(": "pg_set_client_encoding()",
    "pg_clientencoding(": "pg_client_encoding()"
};


const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

function inspect(editor: TextEditor, sourceCode: string) {
    const sourceCodeArr = sourceCode.split('\n');
    const commentLines = getCommentLines(sourceCodeArr);
    let termDecorationsArray: DecorationOptions[] = [];
    let longCommentDecorationsArray: DecorationOptions[] = [];
    let generalCommentDecorationsArray: DecorationOptions[] = [];
    let termErrorDecorationsArray: DecorationOptions[] = [];
    let count = 0;

    sourceCodeArr.forEach((line, index) => {
        let lowerCaseLine = line.toLowerCase();
        terms.forEach((term) => {
            if (lowerCaseLine.includes(term)) {
                let regTerm = new RegExp(term, 'i');
                let match = lowerCaseLine.match(regTerm);
                if (match && match.index !== undefined) {
                    let range = new Range(new Position(index, match.index), new Position(index, match.index + match[0].length));
                    termDecorationsArray.push({ range });
                    count++;
                }
            }
        });

        termsEncodingErrors.forEach((termError) => {
            let regTermError = new RegExp(termError, 'gi');
            let matchesError = [...lowerCaseLine.matchAll(regTermError)];
            
            matchesError.forEach(matchError => {
                if (matchError.index !== undefined) {
                    let range = new Range(new Position(index, matchError.index), new Position(index, matchError.index + matchError[0].length));
                    termErrorDecorationsArray.push({ range });
                    count++;
                }
            });
        });

        if (commentLines.long.includes(index)) {
            let range = new Range(new Position(index, 0), new Position(index, line.length));
            longCommentDecorationsArray.push({ range });
            count++;
        } else if (commentLines.general.includes(index)) {
            let range = new Range(new Position(index, 0), new Position(index, line.length));
            generalCommentDecorationsArray.push({ range });
            count++;
        }
    });

    editor.setDecorations(decorationType, termDecorationsArray);
    editor.setDecorations(longCommentDecorationType, longCommentDecorationsArray);
    editor.setDecorations(generalCommentDecorationType, generalCommentDecorationsArray);
    editor.setDecorations(encoddingDecorationType, termErrorDecorationsArray);

    return count;
}

function getCommentLines(sourceCodeArr: Array<string>) {
    let commentLines: { long: number[], general: number[] } = { long: [], general: [] };
    let commentStart = -1;
    let inBlockComment = false;
    let inHTMLComment = false;

    sourceCodeArr.forEach((line, index) => {
        const trimmedLine = line.trim();
        const startsBlockComment = trimmedLine.startsWith("/*");
        const endsBlockComment = trimmedLine.includes("*/");
        const startsHTMLComment = trimmedLine.includes("<!--");
        const endsHTMLComment = trimmedLine.includes("-->");
        const isSingleLineComment = trimmedLine.startsWith("//") && !trimmedLine.match(urlRegex);

        // Verifica se a linha atual inicia um bloco de comentário HTML ou de bloco
        if (startsHTMLComment || startsBlockComment) {
            inHTMLComment = startsHTMLComment;
            inBlockComment = startsBlockComment;
            commentStart = commentStart === -1 ? index : commentStart;
        }

        // Se estiver dentro de um bloco de comentário, adiciona a linha ao conjunto apropriado
        if (inHTMLComment || inBlockComment || isSingleLineComment) {
            if (isSingleLineComment && !inBlockComment && !inHTMLComment) {
                // Trata comentários de linha única imediatamente
                commentLines.general.push(index);
            } else {
                // Continua tratando como parte de um bloco de comentário
                if (endsHTMLComment || endsBlockComment) {
                    // Se for o fim de um bloco de comentário, determina se é longo
                    let isLongComment = index - commentStart >= 3;
                    for (let i = commentStart; i <= index; i++) {
                        isLongComment ? commentLines.long.push(i) : commentLines.general.push(i);
                    }
                    // Reseta os indicadores de comentário
                    inHTMLComment = false;
                    inBlockComment = false;
                    commentStart = -1;
                } else if (inHTMLComment || inBlockComment) {
                    // Se ainda dentro de um bloco de comentário, mas não é o fim
                    commentLines.general.push(index);
                }
            }
        }

        // Se a linha contém o término de um bloco de comentário, mas não iniciou um novo
        if ((endsBlockComment && !startsBlockComment) || (endsHTMLComment && !startsHTMLComment)) {
            inBlockComment = false;
            inHTMLComment = false;
            commentStart = -1;
        }
    });

    return commentLines;
}


function runExtension(type: number, event: any) {
	let openEditor = window.visibleTextEditors.filter(editor => editor.document.uri)[0];
	let sourceCode = openEditor.document.getText();
	if(type === 1){
         openEditor = window.visibleTextEditors.filter(editor => editor.document.uri === event.document.uri)[0];
    }
	window.withProgress({
		location: ProgressLocation.Window,
		title: "Running Inspection!",
		cancellable: false
	}, _ => {
		const p = new Promise(resolve => {
			try {
				const inspection = inspect(openEditor, sourceCode);
				window.showInformationMessage(inspection > 0 ? "Ei! eu encontrei " + inspection + " itens que você deve dar uma olhada!" : "Tudo limpo por aqui!");
			} catch(e) {
				window.showErrorMessage("Erro de leitura!");
				console.error(e);
			}
			setTimeout(_=>resolve(null), 3000);
		})
		return p;
	});
}

let activeEditor = vscode.window.activeTextEditor;
//let activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
let saveEventDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
    let disposableCommand = vscode.commands.registerCommand('code-tracker.code-tracker', () => {
        runExtension(0, false);
        // Certifique-se de que o evento só é registrado uma vez
        if (!saveEventDisposable) {
            saveEventDisposable = vscode.workspace.onWillSaveTextDocument(e => {
                runExtension(1, e);
            });
            // Adiciona o disposable do evento ao contexto para garantir a limpeza
            context.subscriptions.push(saveEventDisposable);
        }
    });
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
    }));
    let disableCommand = vscode.commands.registerCommand('code-tracker.disable', () => {
        // Verifica se o disposable do evento existe e o descarta
        console.log("Desativando a extensão");
        if (saveEventDisposable) {
            saveEventDisposable.dispose();
            // Limpa a variável saveEventDisposable após a desativação
            saveEventDisposable = undefined;
        }
        if (activeEditor) {
            activeEditor.setDecorations(decorationType, []);
            activeEditor.setDecorations(longCommentDecorationType, []);
            activeEditor.setDecorations(generalCommentDecorationType, []);
            activeEditor.setDecorations(encoddingDecorationType, []);
        }
    });

    // Adiciona os comandos ao contexto para garantir que eles sejam descartados corretamente quando a extensão for desativada
    context.subscriptions.push(disposableCommand, disableCommand);
}