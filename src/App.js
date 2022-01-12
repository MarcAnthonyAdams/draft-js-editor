import React, { useState, useEffect, useRef } from "react";
import './App.css';
import Editor from '@draft-js-plugins/editor';
import { EditorState } from 'draft-js';
// hashTag plugin is working fine.
import createHashtagPlugin from '@draft-js-plugins/hashtag';
import hashtagStyles from "./hashtagStyles.module.css";
// Cannot get the video plugin to work.
import createVideoPlugin from '@draft-js-plugins/video';
// Cannot get the emoji plugin to work.
import createEmojiPlugin from '@draft-js-plugins/emoji';
// the mentions plugin is somewhat working....however I cannot get it to work 
// with fetched api.
import createMentionPlugin, {
    defaultSuggestionsFilter,
    MentionData,
    MentionPluginTheme,
  } from '@draft-js-plugins/mention';
import mentions from './mentions';

import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/mention/lib/plugin.css';



// This has to be outside the component function in order for the editor to work. 
const hashtagPlugin = createHashtagPlugin({ theme: hashtagStyles });    
const videoPlugin = createVideoPlugin();
const mentionPlugin = createMentionPlugin();
const emojiPlugin = createEmojiPlugin(); 
const { MentionSuggestions } = mentionPlugin;
const plugins = [mentionPlugin, hashtagPlugin, videoPlugin, emojiPlugin];




function App() {

    const editor = useRef();

    const [ editorState, setEditorState ] = useState(EditorState.createEmpty());
    const [ open, setOpen ] = useState(false);
    const [ people, setPeople ] = useState([]);
    const [ customMentions, setCustomMentions ] = useState();


    /* 
         "mentions" are the example array given with the plugin documentation.
        "customMentons" are the fetched API array.... obviously lol.
        The issue is that I cant get the editor mentions popup "<MentionSuggetions />" 
        to populate with the custom array.
    */

    /*  
        ****to use either or, just comment out the usestate below and the corresponding
        "setSuggestions" on lines on 105 and 106.
    */

    //const [ suggestions, setSuggestions ] = useState(customMentions);
    const [ suggestions, setSuggestions ] = useState(mentions);

    const contentState = editorState.getCurrentContent(); 

    // api fetch from "rickandmortyapi.com".
    useEffect(() => {
        setPeople([]);
        const abortController = new AbortController();
        async function loadPeople() {
          try {
            const res = await fetch(
              "https://rickandmortyapi.com/api/character/1,2,3,4,5,6",
              { signal: abortController.signal }
            );
            const peopleAPI = await res.json();
            setPeople(peopleAPI);
          } catch (err) {
            if (err.name === "AbortError") {
            } else {
              throw err;
            }
          }
        }
        loadPeople();
        return () => abortController.abort();
      }, []);

      // This useEffect is to map out fetched api to fit the same data structure as default mentions array.
      useEffect(() => {
        if (people) {
            const peopleMap = people.map((person) => ({ name: person.name, avatar: person.image}))
            console.log(peopleMap)
            setCustomMentions(peopleMap)
        }
    }, [people]);

    
    // this opens and closes the mentions pop up
    const onOpenChange = () => {
        setOpen(!open);
    };

    // this changes the array to fit what is typed in editor 
    const onSearchChange = ({ value }) => {
        if (value) {
            //setSuggestions(defaultSuggestionsFilter(value, customMentions))
            setSuggestions(defaultSuggestionsFilter(value, mentions))
        }
    };

  return (
    <div className="App">
        <div className="draft-js-editor">
            <Editor
                toolbarHidden
                editorState={editorState}
                onChange={setEditorState}
                plugins={plugins}
                placeholder={"Type something..."}
                ref={editor}
            />
            {customMentions &&
            <MentionSuggestions
                open={open}
                onOpenChange={onOpenChange}
                onSearchChange={onSearchChange}
                suggestions={suggestions}                            
            />}
        </div>
    </div>
  );
}

export default App;